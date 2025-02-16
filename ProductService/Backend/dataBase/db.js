const mongoose = require('mongoose');


const connectedDb = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URL)
    console.log('Connected to the database');
  }catch(err){
    console.log(err);
  }
}

module.exports = connectedDb;