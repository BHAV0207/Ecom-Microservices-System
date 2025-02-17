const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const dotenv = require('dotenv');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

dotenv.config();

async function startServer() {
  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start(); 
  
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 7000;
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => console.error("Server failed to start:", err));
