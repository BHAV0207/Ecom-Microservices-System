# Use the official Node.js 20 Alpine image as the base image
FROM node:20-alpine

# Install build dependencies (only needed for native module compilation)
RUN apk add --no-cache python3 make g++

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json into the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files into the working directory
COPY . .

# Expose the port your application will run on (default 8001 as defined in your app)
EXPOSE 8001

# Start the server when the container is started
CMD ["npm", "start"]
