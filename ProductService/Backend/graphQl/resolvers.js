const Product = require("../model/productModel");

const resolvers = {
  Query: {
    allProducts: async () => await Product.find(),
    getProduct: async (_, { id }) => await Product.findById(id),
  },
  Mutation: {
    createProduct : async(_ , {name , price , stock}) => {
      const product = new Product({ name, price, stock });
      return await product.save();
    },

    updateProduct: async(_ , {id , stock}) => {
      const product = await Product.findById(id);
      if (product) {
        product.stock = stock;
        return await product.save();
      }
      throw new Error('Product not found');
    },
    deleteProduct: async(_ , {id}) => {
      const product = await Product.findById(id);
      if(product){
        await Product.deleteOne({_id :id});
        return "Product deleted"
      }
      throw new Error('Product not found');
    },
  },
};



module.exports = resolvers;