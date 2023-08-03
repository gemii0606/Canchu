const Redis = require('ioredis');
const redisClient = new Redis({
    port: 6379,
    host: 'canchu_redis'
    });

module.exports = redisClient;