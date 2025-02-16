const express = require('express');
const app = express();
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./dataBase/db');
connectDB();

app.use(express.json());

const OrderRoutes = require('./routes/OrderRoutes');
app.use('/order', OrderRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


