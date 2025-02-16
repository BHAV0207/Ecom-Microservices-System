const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectedDb = require('./dataBase/db');

dotenv.config();
connectedDb();
app.use(express.json());

const productRouter = require('./router/productRouter');
app.use('/product', productRouter);

const port = 7000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





