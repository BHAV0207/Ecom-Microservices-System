const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middelWare/authMiddleware");
const redisClient = require("../redisClient");

Router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    await redisClient.del("allUsers");

    res.status(200).json({ message: "User created successfully", newUser });
  } catch (err) {
    res.status(500).json({ message: "Error Registering User" });
  }
});

Router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Error Logging In" });
  }
});

Router.get("/all", async (req, res) => {
  try {
    const cachedUsers = await redisClient.get("allUsers");

    if (cachedUsers) {
      return res.status(200).json(JSON.parse(cachedUsers));
    }

    const users = await User.find();

    await redisClient.setEx("allUsers", 300, JSON.stringify(users));

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error Fetching Users" });
  }
});

Router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const cachedUser = await redisClient.get(`user:${id}`);

    if (cachedUser) {
      return res.status(200).json(JSON.parse(cachedUser));
    }

    const user = await User.findById(id);
    if (!user) return res.status(400).json({ message: "User does not exist" });

    await redisClient.setEx(`user:${id}`, 300, JSON.stringify(user));

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error Fetching User" });
  }
});

Router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    const userExists = await User.exists({ _id: id });
    if (!userExists) {
      return res.status(400).json({ message: "User does not exist" });
    }

    await User.findByIdAndUpdate(id, { name, email, role });

    await redisClient.del(`user:${id}`);
    await redisClient.del("allUsers");

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error Updating User" });
  }
});

module.exports = Router;
