const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("./model/productModel");
const { producer, connectProducer } = require("./kafka"); // Ensure correct import
const connectedDb = require("./dataBase/db");

dotenv.config();
connectedDb();
const app = express();
app.use(express.json());

const productRouter = require("./router/productRouter");
app.use("/product", productRouter);

const PORT = process.env.PORT || 7000;

app.listen(PORT, async () => {
  console.log("Port started for products on " + PORT);

  // ✅ Connect Kafka Producer
  await connectProducer();

  // ✅ Send Kafka event for all existing products at startup
  try {
    const existingProducts = await Product.find();
    console.log(`Sending Kafka events for ${existingProducts.length} existing products...`);

    for (const product of existingProducts) {
      await producer.send({
        topic: "product-created",
        messages: [
          {
            value: JSON.stringify({
              productId: product._id,
              stock: product.stock,
            }),
          },
        ],
      });
      console.log(`Kafka: Sent product-created event for existing product ID: ${product._id}`);
    }
  } catch (error) {
    console.error("Error fetching existing products:", error);
  }

  // ✅ Watch MongoDB for new products and send Kafka event
  Product.watch().on("change", async (change) => {
    if (change.operationType === "insert") {
      const newProduct = change.fullDocument;
      console.log(`New product detected: ${newProduct._id}`);

      // Send Kafka event for new product
      await producer.send({
        topic: "product-created",
        messages: [
          {
            value: JSON.stringify({
              productId: newProduct._id,
              stock: newProduct.stock,
            }),
          },
        ],
      });

      console.log(`Kafka: Sent product-created event for product ID: ${newProduct._id}`);
    }
  });
});
