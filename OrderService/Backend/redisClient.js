const redis = require("redis");

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost", // Use "redis" inside Docker
    port: process.env.REDIS_PORT || 6379
  }
});

client.on("error", (err) => console.error("Redis Error:", err));

client.connect().then(() => console.log("🚀 Redis Connected Successfully"));

module.exports = client;
