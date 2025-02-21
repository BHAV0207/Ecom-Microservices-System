const express = require("express");
const router = express.Router();
const Product = require("../model/productModel");
const authMiddleware = require("../middleware");
const { connectConsumer } = require("../kafka");
const redisClient = require("../redisClient");

// Consume `order-created` event and update stock in Redis
connectConsumer("order-created", async (message) => {
  try {
    const orderData = JSON.parse(message);
    console.log(`Product Service: Received Order -`, orderData);

    for (const item of orderData.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        if (product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await product.save();

          // Update stock in Redis
          await redisClient.set(`product:${item.productId}:stock`, product.stock);

          console.log(` Updated stock for product ${item.productId}: New stock is ${product.stock}`);
        } else {
          console.error(` Insufficient stock for product ${item.productId}`);
        }
      } else {
        console.error(` Product not found: ${item.productId}`);
      }
    }
  } catch (error) {
    console.error(" Error in Product Service (Kafka Consumer):", error.message);
  }
});

// Get All Products (Use Redis Cache)
router.get("/all", async (req, res) => {
  try {
    const cachedProducts = await redisClient.get("allProducts");

    if (cachedProducts) {
      console.log("Serving products from cache");
      return res.json(JSON.parse(cachedProducts));
    }

    const products = await Product.find();

    //  Cache products for 5 minutes
    await redisClient.setEx("allProducts", 300, JSON.stringify(products));

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Get Single Product (Use Redis Cache)
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const cachedProduct = await redisClient.get(`product:${productId}`);

    if (cachedProduct) {
      console.log(` Serving product ${productId} from cache`);
      return res.json(JSON.parse(cachedProduct));
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: " Product not found" });

    // Cache product for 5 minutes
    await redisClient.setEx(`product:${productId}`, 300, JSON.stringify(product));

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Create a Product (Invalidate Cache)
router.post("/create", async (req, res) => {
  const { name, price, stock } = req.body;

  try {
    const product = new Product({ name, price, stock });
    const newProduct = await product.save();

    console.log(` Product Created: ${newProduct._id}`);

    //  Store stock in Redis
    await redisClient.set(`product:${newProduct._id}:stock`, stock);

    // Invalidate Redis Cache
    await redisClient.del("allProducts");

    res.status(201).json({ message: "Product created", newProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//  Update a Product (Invalidate Cache)
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: " Product not found" });

    product.stock = stock;
    const updatedProduct = await product.save();

    //  Update Redis Cache
    await redisClient.set(`product:${id}:stock`, stock);
    await redisClient.setEx(`product:${id}`, 300, JSON.stringify(updatedProduct));
    await redisClient.del("allProducts");

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a Product (Invalidate Cache)
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.deleteOne({ _id: id });

    // Invalidate Redis Cache
    await redisClient.del(`product:${id}`);
    await redisClient.del("allProducts");

    res.json({ message: " Product deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
