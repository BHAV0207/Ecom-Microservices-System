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

const server = new ApolloServer({ typeDefs, resolvers });

// Start the Apollo Server
const startServer = async () => {
  await server.start(); // Await the server to start
  server.applyMiddleware({ app, path: "/graphql" }); // Apply middleware after server starts

  const port = process.env.PORT || 7001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}${server.graphqlPath}`);
  });
};

// Call the start function
startServer().catch((err) => {
  console.error("Error starting the server:", err);
});
