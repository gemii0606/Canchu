const express = require('express');
const { User } = require('../utils/models/model');
const Redis = require('ioredis');
const redisClient = new Redis();
const router = express.Router();

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route for updating user profile information
router.put('/', checkAuthorization, async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const id = decodedToken.id; // Get the ID of the logged-in user

    // Extract name, introduction, and tags from the request body
    const { name, introduction, tags } = req.body;
    console.log(req.body)

    // Check if at least one field is provided for update
    if (!(name || introduction || tags)) {
      return res.status(400).json({ error: 'You should make one change at least.' });
    }

    // Find the user's current profile information
    const userInfo = await User.findOne({
      where: {
        id: id
      },
      attributes: ['id', 'name', 'introduction', 'tags']
    });

    // Update the user's profile with the provided fields
    const update_user = await userInfo.update({
      name,
      introduction,
      tags
    });

    // Prepare the response data with the updated user ID
    const user = {
      id: update_user.id
    };

    // Delete the user's profile data from Redis to ensure it gets updated
    const deleteKey = `user:${id}:profile`;
    await redisClient.del(deleteKey);

    return res.status(200).json({ data: { user } });

  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
