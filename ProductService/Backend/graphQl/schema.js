const {gql} =  require('apollo-server-express');

const typeDefs = gql`
  type Product{
    id:ID!,
    name:String!,
    price:Float!,
    stock:Int!,  
  }

  type Query{
    allProducts: [Product],
    getProduct(id:ID!):Product 
  }

  type Mutation {
    createProduct(name:String! , price : Float! , stock: Int!) : Product,
    updateProduct(id:ID! , stock:Int!):Product,
    deleteProduct(id:ID!) :String
  }
`

module.exports = typeDefs;