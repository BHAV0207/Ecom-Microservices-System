const axios = require("axios");

const USER_SERVICE_URL = "http://localhost:8002";
const PRODUCT_SERVICE_URL = "http://localhost:8000";

const resolvers = {
  Query: {
    allUsers: async () => {
      try {
        const response = await axios.get(`${USER_SERVICE_URL}/user/all`);
        return response.data.map((user) => ({
          id: user._id, // Map _id to id
          name: user.name,
          email: user.email,
          role: user.role,
        }));
      } catch (error) {
        throw new Error("Failed to fetch users");
      }
    },

    getUser: async (_, { id }) => {
      try {
        const response = await axios.get(`${USER_SERVICE_URL}/user/${id}`);
        const user = response.data;
        return {
          id: user._id, // Fix _id to id
          name: user.name,
          email: user.email,
          role: user.role,
        };
      } catch (error) {
        throw new Error("User not found");
      }
    },

    allProducts: async() => {
      try{
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/product/all`);
        return response.data.map((product) => ({
          id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock
        }))
      }
      catch(err){
        throw new Error("Failed to fetch users");
      }
    },

    getProduct: async(_ , {id}) => {
      try{
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/product/${id}`);
        console.log(response.data)
        const product = response.data;
        return {
          id : product._id,
          name : product.name,
          price : product.price,
          stock : product.value
        }
      }catch(err){
        throw new Error("User not found");
      }
    } 
  },
  Mutation: {
    createUser: async (_, { name, email, password, role }) => {
      try {
        const uri = `${USER_SERVICE_URL}/user/register`;
        const response = await axios.post(uri, {
          name,
          email,
          password,
          role,
        });
        const user = response.data.newUser; // Fix: Extract user from API response

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          password: null, // Hide password for security
        };
      } catch (error) {
        throw new Error("User creation failed");
      }
    },

    updateUser: async (_, { id, name, email, role }) => {
      const response = await axios.put(`${USER_SERVICE_URL}/user/${id}`, {
        name,
        email,
        role,
      });

      const user = response.data;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },

    login: async (_, {email, password}) =>{
      const res = await axios.post(`${USER_SERVICE_URL}/user/login`, { email, password });
      const data = res.data;
      
      return{
        token : data.token
      }

    }

  },
};

module.exports = resolvers;
