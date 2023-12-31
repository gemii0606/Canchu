const jwt = require('jsonwebtoken');
const multer = require('multer');
const redisClient = require('../utils/redis')
require('dotenv').config();


function checkAuthorization(req, res, next) {
    // check if the access token can be decoded
    if (!req.headers.authorization) {
      return res.status(401).send({ error: 'No token provided' });
    }
    const token = req.headers.authorization.split(' ')[1];
  
    const jwtSecret = process.env.JWT_SECRET;
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(403).send({ error: "Wrong token" });
      }
      const decodedToken = decoded;
      req.decodedToken = decodedToken;
      return next();
    });
  }

const ErrorHandling = async (fn, res) => {
    // handle the function error
    try {
      await fn;
    } catch (err) {
      // Error handling, return server error response
      console.error(`${err.message} `);
      res.status(500).json({ error: 'Server error' });
    }
  }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public'); // Store the uploaded file in the 'public' directory
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded image based on the original name and current timestamp
    cb(null, file.originalname.split('.')[0] + '_' + Date.now() + '.jpg');
    console.log(file.originalname.split('.')[0]);
  }
});

// Create the multer middleware for handling file uploads
const upload = multer({ storage: storage});


const rateLimiter = async (req, res, next) => {
  // Define the rate limit and window size
  const RATE_LIMIT = 100;
  const WINDOW_SIZE = 1;

  // Extract the client's IP address from the request headers
  const clientId = req.headers['x-forwarded-for'];
  
  // Get the current timestamp in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Define a key for storing request information in Redis
  const key = `requests:${clientId}`;

  try {
    // Check the number of requests made within the defined time window
    const requestCount = await redisClient.zcount(key, currentTime - WINDOW_SIZE, currentTime);
    
    // If the request count exceeds the rate limit, respond with a 429 status code
    if (requestCount >= RATE_LIMIT) {
      return res.status(429).send('Too Many Requests');
    }

    // Add the current timestamp to the sorted set in Redis
    const addResult = await redisClient.zadd(key, currentTime, currentTime);
    
    // If the timestamp was added as a new member, set an expiration for the key
    if (addResult === 1) {
      await redisClient.expire(key, WINDOW_SIZE);
    }
    
    // Remove timestamps older than the defined window size to keep the set tidy
    await redisClient.zremrangebyscore(key, 0, currentTime - WINDOW_SIZE);

    next();
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).send('Server Error');
  }
};


module.exports = {
    ErrorHandling,
    checkAuthorization,
    upload,
    rateLimiter
};