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
    role:String!
    password: String
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    allUsers: [User]
    getUser(id: ID!): User
  }

   type Mutation {
    createUser(name: String!, email: String!, password: String! , role:String!): UserWithPassword
    updateUser(id: ID!, username: String, email: String , role:String!): User
    login(email: String!, password: String!): AuthPayload
  }
`;

module.exports = typeDefs;