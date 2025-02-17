const express = require('express');
const connectedDb = require('./utils/DataBase');
const { ApolloServer } = require('apollo-server-express');
const resolvers = require('../Backend/graphQl/resolver');
const typeDefs = require('../Backend/graphQl/schema');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

connectedDb();
app.use(express.json());


const userRoutes = require('./Routes/userRoutes');
app.use('/user', userRoutes);

const server = new ApolloServer({ typeDefs, resolvers });

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" }); 

  const port = process.env.PORT || 7003;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}${server.graphqlPath}`);
  });
};

startServer().catch((err) => {
  console.error("Error starting the server:", err);
});
