const jwt = require('jsonwebtoken');
const multer = require('multer');
const Redis = require("ioredis");
const redisClient = new Redis();


function checkAuthorization(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).send({ error: 'No token provided' });
    }
    const token = req.headers.authorization.split(' ')[1];
  
    const jwtSecret = 'Secret';
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
  const RATE_LIMIT = 5; // 允許的請求速率：每秒 100 次請求
  const WINDOW_SIZE = 10; // 設定時間窗口為 60 秒

  const clientId = req.ip; // 使用 IP 地址作為用戶識別符號，你可以根據需要使用其他識別符號
  const currentTime = Math.floor(Date.now() / 1000);
  const key = `requests:${clientId}`;

  try {
    const requestCount = await redisClient.zcount(key, currentTime - WINDOW_SIZE, currentTime);
    if (requestCount >= RATE_LIMIT) {
      return res.status(429).send('Too Many Requests');
    }

    await redisClient.zadd(key, currentTime, currentTime);
    await redisClient.zremrangebyscore(key, 0, currentTime - WINDOW_SIZE);

    next();
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).send('Internal Server Error');
  }
};


module.exports = {
    ErrorHandling,
    checkAuthorization,
    upload,
    rateLimiter
};