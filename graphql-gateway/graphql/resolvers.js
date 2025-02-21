const axios = require("axios");

const USER_SERVICE_URL = "http://user-service:8000"; // Changed from localhost
const PRODUCT_SERVICE_URL = "http://product-service:8002"; // Changed from localhost
const ORDER_SERVICE_URL = "http://order-service:8001"; // Changed from localhost

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
        console.log(response.data[0]);
        return response.data.map((order) => ({
          id: order._id,
          userId: order.userId,
          products: order.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            status: product.status,
          }))
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
          id: order._id,
          userId: order.userId,
          products: order.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            status: product.status,
          })),
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
        const response = await axios.post(`${PRODUCT_SERVICE_URL}/product/create`, {
          name,
          price,
          stock,
        });

        const newProduct = response.data.newProduct;

        return {
          id: newProduct._id,
          name: newProduct.name,
          price: newProduct.price,
          stock: newProduct.stock,
        };
      } catch (error) {
        console.error("Product creation error:", error.message);
        throw new Error("Product creation failed");
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

    createOrder: async (_, { userId, products }) => {
      console.log("Creating order...");
      try {
        const response = await axios.post(`${ORDER_SERVICE_URL}/order/create`, {
          userId,
          products,
        });
        console.log(response.data);
        const newOrder = response.data.order;
        console.log(newOrder);

        return {
          id: newOrder._id,
          userId: newOrder.userId,
          products: newOrder.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            status: product.status,
          })),
        };
      } catch (error) {
        console.error("Order creation error:", error.message);
        throw new Error("Order creation failed");
      }
    },

    updateOrder: async (_, { id, userId, products }) => {
      try {
        console.log("Updating order...");
        const response = await axios.put(
          `${ORDER_SERVICE_URL}/order/update/${id}`,
          {
            userId,
            products, // Send the updated product list
          }
        );

        const updatedOrder = response.data.order;

        return {
          id: updatedOrder._id,
          userId: updatedOrder.userId,
          products: updatedOrder.products.map((product) => ({
            id: product.productId,
            quantity: product.quantity,
            status: product.status,
          })),
        };
      } catch (error) {
        console.error("Order update error:", error.message);
        throw new Error("Order update failed");
      }
    },
  },
};

module.exports = resolvers;
