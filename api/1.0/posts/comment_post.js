const express = require('express');
const router = express.Router();
const { Comment } = require('../utils/models/model');
const Redis = require('ioredis');
const redisClient = new Redis();

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to create a new comment
router.post('/', checkAuthorization, async (req, res) => {
  try {
    const post_id = req.baseUrl.split('/').slice(-2, -1)[0]; // Extract the post ID from the URL
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token
    const { content } = req.body; // Get the comment content from the request body

    // Create a new comment in the database
    const cr_comment = await Comment.create({
      post_id,
      commenter_id: user_id,
      content,
    });

    // Prepare the response data with the IDs of the post and the comment
    const post = {
      id: post_id,
    };
    const comment = {
      id: cr_comment.id,
    };

    // Delete the corresponding post key from Redis to invalidate the cache
    const deleteKey = `post:${post.id}`;
    await redisClient.del(deleteKey);

    // Send the response with the post and comment information
    return res.status(200).json({ data: { post, comment } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
