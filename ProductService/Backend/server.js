const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const dotenv = require("dotenv");
const app = express();
const connectedDb = require("./dataBase/db");
const typeDefs = require("./graphQl/schema");
const resolvers = require("./graphQl/resolvers");

dotenv.config();
connectedDb();
app.use(express.json());

const productRouter = require("./router/productRouter");
app.use("/product", productRouter);


const PORT = process.env.PORT || 7000
app.listen(PORT, ()=> {
  console.log("port started " + PORT)
})