const express = require('express');
const mongoose = require('mongoose');
const connectedDb = require('./utils/DataBase');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

connectedDb();
app.use(express.json());


const userRoutes = require('./Routes/userRoutes');
app.use('/user', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});