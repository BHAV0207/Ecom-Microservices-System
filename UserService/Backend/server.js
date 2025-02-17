const express = require('express');
const connectedDb = require('./utils/DataBase');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

connectedDb();
app.use(express.json());


const userRoutes = require('./Routes/userRoutes');
app.use('/user', userRoutes);

const PORT = process.env.PORT || 7001
app.listen(PORT, ()=> {
  console.log("port started " + PORT)
})