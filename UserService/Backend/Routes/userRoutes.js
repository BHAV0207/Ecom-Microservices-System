const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middelWare/authMiddleware");
const {producer , connectProducer} = require('../kafka');

connectProducer();

Router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    await producer.send({
      topic : 'user-created',
      messages : [{ value : JSON.stringify(newUser)}]
    })

    res.status(200).json({ message: "User created successfully" , newUser } );
  } catch (err) {
    console.log(err);
  }
});

Router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
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
    console.log(err);
  }
});

Router.get('/all' , async (req , res) => {
  try{
    const users = await User.find();
    res.status(200).json(users)
  }catch(err){
    console.log(err)
  }
})

Router.get('/:id' ,authMiddleware, async (req , res) => {
  const {id} = req.params;
  try{

    const userExists = await User.exists({_id:id});
    if(!userExists){
      return res.status(400).json({message : 'User does not exist'})
    }
    const user = await User.findById(req.params.id);
    res.status(200).json(user)
  }catch(err){
    console.log(err)
  }
})

Router.put('/:id' ,authMiddleware , async (req , res) => {
  const {id} = req.params;
  const {name , email , role} = req.body;
  try{
    const userExists = await User.exists({_id:id});
    if(!userExists){
      return res.status(400).json({message : 'User does not exist'})
    }
    await User.findByIdAndUpdate(id , {name , email , role});
    res.status(200).json({message : 'User updated successfully'})
  }catch(err){
    console.log(err)
  }
})

module.exports = Router;
