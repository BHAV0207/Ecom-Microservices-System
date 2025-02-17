const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const resolver =  {
  Query: {
    allUsers : async () =>await User.find(),
    getUser: async(_ , {id}) => await User.findById(id),
  },

  Mutation : {
    createUser: async(_ , {name , email , password , role}) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword , role});
      return await user.save();
    },

    updateUser: async (_, { id, username, email , role }) => {
      const user = await User.findById(id);
      if (user) {
        if (username) user.username = username;
        if (email) user.email = email;
        if(role) user.role = role;
        return await user.save();
      }
      throw new Error('User not found');
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid password');
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return { token, user: { id: user.id, username: user.username, email: user.email, } };
    },
  }
}


module.exports = resolver;