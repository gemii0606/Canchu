const express = require('express');
const { User } = require('../utils/models/model');
const multer = require('multer');
const Redis = require('ioredis');
const redisClient = new Redis();
const router = express.Router();

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Configure multer storage for file upload
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
const upload = multer({ storage: storage });

// Route for updating user profile picture
router.put('/', checkAuthorization, upload.single('picture'), async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const id = decodedToken.id; // Get the ID of the logged-in user

    // Check if an image file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Get the generated filename and construct the full picture path
    const fileName = req.file.filename;
    const picturePath = 'https://13.210.26.62/' + fileName;

    // Find the user's current profile information
    const userInfo = await User.findOne({
      where: {
        id: id
      },
      attributes: ['id', 'picture']
    });

    // Update the user's profile with the new picture path
    userInfo.picture = picturePath;
    await userInfo.save();

    // Delete the user's profile data from Redis to ensure it gets updated
    const deleteKey = `user:${id}:profile`;
    await redisClient.del(deleteKey);

    return res.status(200).json({ picture: picturePath });

  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
