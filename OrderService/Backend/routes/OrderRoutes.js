const express = require("express");
const router = express.Router();
const Order = require("../models/OrderModel");
const { producer, connectProducer, connectConsumer } = require("../kafka");
const redisClient = require("../redisClient"); // Import Redis Client

connectProducer();

// Consume `product-created` event and store stock in Redis
connectConsumer("product-created", async (message) => {
  try {
    const { productId, stock } = JSON.parse(message);

    // Store stock in Redis
    await redisClient.set(`product:${productId}:stock`, stock);

    console.log(
      `Order Service: Stored product ${productId} with stock ${stock} in Redis`
    );
  } catch (error) {
    console.error(" Error in Order Service (Kafka Consumer):", error.message);
  }
});

// Create an Order (Check Redis for Stock & Cache Order)
router.post("/create", async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Validate stock availability from Redis
    for (const item of products) {
      const stock = await redisClient.get(`product:${item.productId}:stock`);

      if (stock === null) {
        return res
          .status(400)
          .json({ message: `Product ${item.productId} not found` });
      }

      if (parseInt(stock) < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for product ${item.productId}` });
      }
    }

    // Reduce stock in Redis
    for (const item of products) {
      const stock = await redisClient.get(`product:${item.productId}:stock`);
      const newStock = parseInt(stock) - item.quantity;
      await redisClient.set(`product:${item.productId}:stock`, newStock);
    }

    const order = new Order({ userId, products });
    await order.save();

    // Cache newly created order in Redis
    await redisClient.setEx(`order:${order._id}`, 300, JSON.stringify(order));
    await redisClient.del("allOrders"); // Invalidate all orders cache

    // Send `order-created` event to Kafka
    await producer.send({
      topic: "order-created",
      messages: [{ value: JSON.stringify(order) }],
    });

    console.log(
      `🚀 Kafka: Sent order-created event for order ID: ${order._id}`
    );

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: " Error Creating Order: " + error.message });
  }
});

//  Get All Orders (Use Redis Cache)
router.get("/all", async (req, res) => {
  try {
    const cachedOrders = await redisClient.get("allOrders");

    if (cachedOrders) {
      console.log(" Serving orders from cache");
      return res.json(JSON.parse(cachedOrders));
    }

    const orders = await Order.find();

    // Cache fetched orders for 5 minutes
    await redisClient.setEx("allOrders", 300, JSON.stringify(orders));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Get Single Order (Use Redis Cache)
router.get("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const cachedOrder = await redisClient.get(`order:${orderId}`);

    if (cachedOrder) {
      console.log(` Serving order ${orderId} from cache`);
      return res.json(JSON.parse(cachedOrder));
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Cache fetched order for 5 minutes
    await redisClient.setEx(`order:${orderId}`, 300, JSON.stringify(order));

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Update an Order (Invalidate Cache)
router.put("/update/:id", async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (
      !userId ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    for (const product of products) {
      if (!product.productId || !product.quantity) {
        return res
          .status(400)
          .json({ message: "Each product must have productId and quantity" });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { userId, products },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update Redis cache
    await redisClient.setEx(
      `order:${updatedOrder._id}`,
      300,
      JSON.stringify(updatedOrder)
    );
    await redisClient.del("allOrders"); // Invalidate all orders cache

    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Delete an Order (Invalidate Cache)
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.deleteOne({ _id: id });

    // Invalidate Redis cache
    await redisClient.del(`order:${id}`);
    await redisClient.del("allOrders");

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
