// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,  
    // required: true,
  },
  productId: {
    type: String, 
    // required: true,
  },
  name:{
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: { type:String, Enum:['placed','shipped','delivered'], default:'placed'},
});

module.exports = mongoose.model('Order', OrderSchema);
