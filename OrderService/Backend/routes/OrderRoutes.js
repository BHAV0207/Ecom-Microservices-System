const express = require("express");
const router = express.Router();
const Order = require("../models/OrderModel");
const { producer, connectProducer, connectConsumer } = require("../kafka");

connectProducer();

const productStock = {};

connectConsumer("product-created", (message) => {
  try{
    const { productId, stock } = JSON.parse(message);
    productStock[productId] = stock; // Store stock information
    console.log(`Order Service: Stored product ${productId} with stock ${stock}`);
  }
  catch(error){
    console.error("Error in Order Service : REQUIRED :", error.message);
  }
});

router.post("/create", async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Validate stock availability
    for (const item of products) {
      const stock = productStock[item.productId];
      if (stock === undefined) {
        return res
          .status(400)
          .json({ message: `Product ${item.productId} not found` });
      }
      if (stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for product ${item.productId}` });
      }
    }

    // Reduce stock in local memory
    for (const item of products) {
      productStock[item.productId] -= item.quantity;
    }

    const order = new Order({ userId, products });
    await order.save();

    // Send event to Kafka
    await producer.send({
      topic: "order-created",
      messages: [{ value: JSON.stringify(order) }],
    });

    console.log(`Kafka: Sent order-created event for order ID: ${order._id}`);

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message  + ""});
  }
});

router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
          .json({ message: "Each product must have _id and quantity" });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        userId,
        products: products,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
