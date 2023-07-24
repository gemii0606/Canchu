const express = require('express');
const router = express.Router();
const Redis = require('ioredis');
const redisClient = new Redis();
const { User, Friendship, Event } = require('../utils/models/model');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to accept a friend request
router.post('/', checkAuthorization, async (req, res) => {
  try {
    // Extract the friendship ID from the request URL
    const reqFriendshipId = req.baseUrl.split('/').slice(-2, -1)[0];
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const friendship_id = parseInt(reqFriendshipId); // Get the ID of the friendship from the request

    // Find the friendship to be accepted
    const friendship = await Friendship.findOne({
      where: { id: friendship_id },
    });

    // Check if the friendship status is already 'friend'
    if (friendship.status === 'friend') {
      return res.status(400).json({ error: 'You are already friends.' });
    }

    // Check if the current user is the receiver of the friend request
    if (friendship.from_id === user_id) {
      return res.status(400).json({ error: 'You are not the receiver.' });
    }

    // Update the status of the friendship to 'friend'
    friendship.status = 'friend';
    await friendship.save(); // Save this change permanently in the database
    console.log(friendship);

    // Find the user's ID and name who sent the friend request
    const accept_event = await User.findOne({
      where: { id: friendship.from_id },
      attributes: ['id', 'name'],
    });

    // Create an 'accept' event in the events table. Note: when sending an agree message, you are the sender.
    const events = await Event.create({
      from_id: user_id,
      to_id: accept_event.dataValues.id,
      type: 'friend_accept',
      is_read: false,
      summary: `${accept_event.dataValues.name} has accepted your friend request.`,
    });

    // Delete the associated Redis key to remove cached data
    const deleteKey = `user:${friendship.to_id}:friendship:${user_id}`;
    await redisClient.del(deleteKey);

    return res.status(200).json({ data: { friendship: { id: friendship.id } } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
