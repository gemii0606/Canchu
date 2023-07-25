const express = require('express');
const router = express.Router();
const { User, Friendship } = require('../utils/models/model');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

const friendPending = async (req, res) => {
    const decodedToken = req.decodedToken;
    const to_id = decodedToken.id; // Get the receiver's ID from the decoded token

    // Get the pending friend requests info from the friendships table,
    // and include the associated sender's info from the users table
    const friendships_info = await Friendship.findAll({
      where: { to_id, status: 'pending' },
      attributes: ['id', 'from_id', 'to_id'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'picture'],
          as: 'fromUser', // Use 'fromUser' as the alias for the User model in the Friendship association
        },
      ],
    });

    // Reform the data to get the desired format
    const users = friendships_info.map((friend) => {
      const user_info = friend.fromUser.dataValues; // Get the sender's info from the associated User model
      const data = {
        ...user_info,
        friendship: {
          id: friend.id,
          status: 'pending',
        },
      };
      return data;
    });

    // Send the response with the formatted users data
    return res.status(200).json({ data: { users } });
}


// Route to get pending friend requests
router.get('/', checkAuthorization, async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const to_id = decodedToken.id; // Get the receiver's ID from the decoded token

    // Get the pending friend requests info from the friendships table,
    // and include the associated sender's info from the users table
    const friendships_info = await Friendship.findAll({
      where: { to_id, status: 'pending' },
      attributes: ['id', 'from_id', 'to_id'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'picture'],
          as: 'fromUser', // Use 'fromUser' as the alias for the User model in the Friendship association
        },
      ],
    });

    // Reform the data to get the desired format
    const users = friendships_info.map((friend) => {
      const user_info = friend.fromUser.dataValues; // Get the sender's info from the associated User model
      const data = {
        ...user_info,
        friendship: {
          id: friend.id,
          status: 'pending',
        },
      };
      return data;
    });

    // Send the response with the formatted users data
    return res.status(200).json({ data: { users } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
