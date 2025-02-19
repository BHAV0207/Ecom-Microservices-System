const axios = require("axios");

const USER_SERVICE_URL = "http://localhost:8000";
const PRODUCT_SERVICE_URL = "http://localhost:8002";
const ORDER_SERVICE_URL = "http://localhost:8001";

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

    allProducts: async () => {
      try {
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/product/all`);
        return response.data.map((product) => ({
          id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
        }));
      } catch (err) {
        throw new Error("Failed to fetch users");
      }
    },

    getProduct: async (_, { id }) => {
      try {
        const response = await axios.get(
          `${PRODUCT_SERVICE_URL}/product/${id}`
        );
        console.log(response.data);
        const product = response.data;
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
        };
      } catch (err) {
        throw new Error("Product not found");
      }
    },

    allOrders: async () => {
      try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/order/all`);
        return response.data.map((order) => ({
          userId: order.userId,
          productId: order.productId,
          id: order._id,
          name: order.name,
          quantity: order.quantity,
          status: order.status,
        }));
      } catch (error) {
        throw new Error("Failed to fetch orders");
      }
    },

    getOrder: async (_, { id }) => {
      try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/order/${id}`);
        const order = response.data;
        return {
          userId: order.userId,
          productId: order.productId,
          id: order._id,
          name: order.name,
          quantity: order.quantity,
          status: order.status,
        };
      } catch (error) {
        throw new Error("Order not found");
      }
    },
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

    login: async (_, { email, password }) => {
      const res = await axios.post(`${USER_SERVICE_URL}/user/login`, {
        email,
        password,
      });
      const data = res.data;

      return {
        token: data.token,
      };
    },

    createProduct: async (_, { name, price, stock }) => {
      try {
        const response = await axios.post(
          `${PRODUCT_SERVICE_URL}/product/create`,
          {
            name,
            price,
            stock,
          }
        );
        const newProduct = response.data;
        return {
          id: newProduct._id,
          name: newProduct.name,
          price: newProduct.price,
          stock: newProduct.stock,
        };
      } catch (error) {
        throw new Error("Product creation failed");
      }
    },

    updateProduct: async (_, { id, stock }) => {
      try {
        const response = await axios.put(
          `${PRODUCT_SERVICE_URL}/product/update/${id}`,
          {
            stock,
          }
        );
        const updateProduct = response.data;
        return {
          id: updateProduct._id,
          name: updateProduct.name,
          price: updateProduct.price,
          stock: updateProduct.stock,
        };
      } catch (error) {
        throw new Error("Product update failed");
      }
    },

    deleteProduct: async (_, { id }) => {
      try {
        const response = await axios.delete(
          `${PRODUCT_SERVICE_URL}/product/delete/${id}`
        );
        return response.data;
      } catch (error) {
        throw new Error("Product deletion failed");
      }
    },

    createOrder: async (_, { userId, productId, name, quantity, status }) => {
      try {
        const response = await axios.post(`${ORDER_SERVICE_URL}/order/create`, {
          userId,
          productId,
          name,
          quantity,
          status,
        });
        const newOrder = response.data;
        return {
          userId: newOrder.userId,
          productId: newOrder.productId,
          id: newOrder._id,
          name: newOrder.name,
          quantity: newOrder.quantity,
          status: newOrder.status,
        };
      } catch (error) {
        throw new Error("Order creation failed");
      }
    },

    updateOrder: async (_, { id, userId, productId, name, quantity, status }) => {
      try {
        console.log("Updating order...");
        const response = await axios.put(`${ORDER_SERVICE_URL}/order/update/${id}`, {
          userId,
          productId,
          name,
          quantity,
          status,
        });
        const updatedOrder = response.data;
        return {
          userId: updatedOrder.userId,
          productId: updatedOrder.productId,
          id: updatedOrder._id,
          name: updatedOrder.name,
          quantity: updatedOrder.quantity,
          status: updatedOrder.status,
        };
      } catch (error) {
        throw new Error("Order update failed");
      }
    },
  },
};

module.exports = resolvers;
