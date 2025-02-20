const express = require("express");
const router = express.Router();

const Product = require("../model/productModel");
const authMiddleware = require("../middleware");

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id" , async (req, res) => {
  try{
    const products = await Product.findById(req.params.id);
    res.json(products);
  }catch(error){
    res.status(404).json({message: "Product not found"});

  }
})

router.post("/create", authMiddleware, async (req, res) => {
  const { name, price, stock } = req.body;

  try {
    const product = new Product({
      name,
      price,
      stock,
    });

    const newProduct = await product.save();
    res.status(201).json({message : "product created" , newProduct});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  try {
    const product = await Product.findById(id);
    if (product) {
      product.stock = stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (product) {
      await Product.deleteOne({ _id: id });
      res.json({ message: "Product deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message + "product coulden,t be deleted" });
  }
});

module.exports = router;
