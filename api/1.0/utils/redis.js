require('dotenv').config();
const Redis = require('ioredis');
let redisClient = null;

// 根據需要初始化 Redis Client
if (process.env.USE_REDIS === 'true') {
  redisClient = new Redis({
    port: 6379,
    host: process.env.RD_HOST
  });
}

module.exports = redisClient;