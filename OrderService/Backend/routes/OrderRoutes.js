const express = require("express");

const router = express.Router();
const Order = require("../models/OrderModel");

router.post("/create", async (req, res) => {
  try {
    const { userId, productId, name, quantity, status } = req.body;

    if (!quantity || !name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const order = new Order({
      userId,
      productId,
      name,
      quantity,
      status,
    });

    await order.save();

    res.status(201).json(order);
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

router.get("/find/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { userId, productId, quantity, name, status } = req.body;

    if (!quantity) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const newOrder = {
      userId,
      productId,
      name,
      quantity,
      status,
    };

    const order = await Order.findByIdAndUpdate(req.params.id, newOrder, {
      new: true,
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
