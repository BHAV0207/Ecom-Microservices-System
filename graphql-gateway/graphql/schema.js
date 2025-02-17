const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type UserWithPassword {
    id: ID!
    name: String!
    email: String!
    role: String!
    password: String
  }

  type AuthPayload {
    token: String
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    stock: Int!
  }

  type Order {
    userId: ID
    productId: ID
    id: ID!
    name : String!
    quantity: Int!
    status: String!
  }

  type Query {
    allUsers: [User]
    getUser(id: ID!): User

    allProducts: [Product]
    getProduct(id: ID!): Product

    allOrders: [Order]
    getOrder(id: ID!): Order
  }

  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      role: String!
    ): UserWithPassword
    updateUser(id: ID!, name: String, email: String, role: String!): User
    login(email: String!, password: String!): AuthPayload

    createProduct(name: String!, price: Float!, stock: Int!): Product
    updateProduct(id: ID!, stock: Int!): Product
    deleteProduct(id: ID!): String

    createOrder(userId: ID, productId: ID, name: String!, quantity: Int!, status: String!): Order
    updateOrder(id: ID!, userId: ID, productId: ID, name: String, quantity: Int, status: String): Order
  }
`;

module.exports = typeDefs;
