require('dotenv').config();
const Redis = require('ioredis');
const redisClient = new Redis({
    port: 6379,
    host: process.env.RD_HOST
    });

module.exports = redisClient;