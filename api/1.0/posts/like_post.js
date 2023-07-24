const express = require('express');
const router = express.Router();
const { Post, Like } = require('../utils/models/model');
const Redis = require('ioredis');
const redisClient = new Redis();

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to create a new like on a post
router.post('/', checkAuthorization, async (req, res) => {
  try {
    const post_id = req.baseUrl.split('/').slice(-2, -1)[0]; // Extract the post ID from the URL
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token

    // Check if the post exists
    const find_post = await Post.findOne({
      where: {
        id: post_id,
      },
      attributes: ['id'],
    });

    if (!find_post) {
      return res.status(400).json({ error: 'Post does not exist.' });
    }

    // Check if the user has already liked the post
    const find_like = await Like.findOne({
      where: {
        post_id,
        liker_id: user_id,
      },
    });

    if (find_like) {
      return res.status(400).json({ error: 'You have already liked this post.' });
    }

    // Create a new like in the database
    const cr_like = await Like.create({
      post_id,
      liker_id: user_id,
    });

    // Prepare the response data with the ID of the post
    const post = {
      id: post_id,
    };

    // Delete the corresponding post and user like keys from Redis to invalidate the cache
    const deleteKey = `post:${post.id}`;
    const likePostKey = `user:${user_id}:post:${post_id}:like`;
    await redisClient.del(deleteKey);
    await redisClient.del(likePostKey);

    // Send the response with the post information
    return res.status(200).json({ data: { post } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to remove a like from a post
router.delete('/', checkAuthorization, async (req, res) => {
  try {
    const post_id = req.baseUrl.split('/').slice(-2, -1)[0]; // Extract the post ID from the URL
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token

    // Check if the user has liked the post
    const find_like = await Like.findOne({
      where: {
        post_id: post_id,
        liker_id: user_id,
      },
      attributes: ['id'],
    });

    if (!find_like) {
      return res.status(400).json({ error: 'You have not liked this post.' });
    }

    // Delete the like entry from the database
    const delete_action = await Like.destroy({
      where: {
        id: find_like.id,
      },
    });

    // Prepare the response data with the ID of the post
    const post = {
      id: post_id,
    };

    // Delete the corresponding post and user like keys from Redis to invalidate the cache
    const deleteKey = `post:${post.id}`;
    const likePostKey = `user:${user_id}:post:${post_id}:like`;
    await redisClient.del(deleteKey);
    await redisClient.del(likePostKey);

    // Send the response with the post information
    return res.status(200).json({ data: { post } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
