const express = require('express');
const router = express.Router();
const Redis = require('ioredis');
const redisClient = new Redis();
const { User, Friendship, Event } = require('../utils/models/model');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to delete a friendship
router.delete('/', checkAuthorization, async (req, res) => {
  try {
    const reqFriendshipId = req.baseUrl.split('/').slice(-1);
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const delete_id = parseInt(reqFriendshipId); // Get the ID of the friendship to delete from the request

    // Find the friendship to be deleted
    const delete_target = await Friendship.findOne({
      where: { id: delete_id },
    });

    // Check if the friendship exists
    if (!delete_target) {
      return res.status(400).json({ error: 'No relationship is found.' });
    }

    // Delete the friendship from the database
    const delete_action = await Friendship.destroy({
      where: { id: delete_id },
    });

    // Delete the associated Redis keys to remove cached data
    const deleteKey_1 = `user:${delete_target.from_id}:friendship:${delete_target.to_id}`;
    const deleteKey_2 = `user:${delete_target.to_id}:friendship:${delete_target.from_id}`;
    await redisClient.del([deleteKey_1, deleteKey_2]);

    return res.status(200).json({ data: { friendship: delete_id } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
