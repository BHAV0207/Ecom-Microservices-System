const express = require("express");
const router = express.Router();
const Order = require("../models/OrderModel");

router.post("/create", async (req, res) => {
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

    const order = new Order({
      userId,
      products: products,
    });

    await order.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
