const express = require('express');
const router = express.Router();
const { Post } = require('../utils/models/model');
const Redis = require('ioredis');
const redisClient = new Redis();

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to create a new post
router.post('/', checkAuthorization, async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token
    const { context } = req.body; // Get the post content from the request body

    // Check if the post content is provided
    if (!context) {
      return res.status(400).json({ error: 'Please write something and post.' });
    }

    // Create a new post in the database
    const cr_post = await Post.create({
      user_id,
      context,
    });

    // Prepare the response data with the ID of the created post
    const post = {
      id: cr_post.id,
    };

    // Delete the corresponding cursor key from Redis to invalidate the cache
    const deleteKey = `user:${user_id}:post:cursor:18446744073709551615`;
    await redisClient.del(deleteKey);

    // Send the response with the post information
    return res.status(200).json({ data: { post } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
