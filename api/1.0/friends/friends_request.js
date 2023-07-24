const express = require('express');
const router = express.Router();
const Redis = require('ioredis');
const redisClient = new Redis();
const { User, Friendship, Event } = require('../utils/models/model');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route for sending a friend request
router.post('/', checkAuthorization, async (req, res) => {
  try {
    // Get the user ID of the receiver from the request URL
    const reqUserId = req.baseUrl.split('/').slice(-2, -1)[0];
    const decodedToken = req.decodedToken;
    const from_id = decodedToken.id;
    const to_id = parseInt(reqUserId);

    // Check if the user to befriend exists
    const user = await User.findOne({ where: { id: to_id } });

    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    // Check if the sender is trying to friend themselves
    if (from_id === to_id) {
      return res.status(400).json({ error: 'You cannot make friend with yourself.' });
    }

    // Check if a friend request has already been sent from the sender to the receiver
    const AtoB = await Friendship.findOne({ where: { from_id, to_id } });

    if (AtoB) {
      return res.status(400).json({ error: 'The friend request has already been sent.' });
    }

    // Check if the receiver has already sent a friend request to the sender
    const BtoA = await Friendship.findOne({ where: { from_id: to_id, to_id: from_id } });

    if (BtoA && BtoA.status === 'pending') {
      return res.status(400).json({ error: 'He/She is waiting for your acceptance.' });
    }

    // Check if the sender and receiver are already friends
    if (BtoA && BtoA.status === 'accepted') {
      return res.status(400).json({ error: 'You are already friends.' });
    }

    // Create a friendship entry in the friendships table to represent the friend request
    const friendship = await Friendship.create({
      from_id,
      to_id
    });

    // Get the sender's name from users
    const request_event = await User.findOne({
      where: { id: from_id },
      attributes: ['name']
    });

    // Create a friend request event in the events table
    const events = await Event.create({
      from_id,
      to_id,
      type: 'friend_request',
      is_read: false,
      summary: `${request_event.dataValues.name} invited you to be friends.`
    });

    // Delete the receiver's friendship info from Redis to ensure it gets updated
    const deleteKey = `user:${to_id}:friendship:${from_id}`;
    await redisClient.del(deleteKey);

    return res.status(200).json({ data: { friendship: { id: friendship.id } } });

  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
