const express = require('express');
const router = express.Router();
const { User, Friendship } = require('../utils/models/model');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to get the user's friends
router.get('/', checkAuthorization, async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user's ID from the decoded token
    
    // Find the user's friendships where status is 'friend' and include the associated User models
    const [friends] = await User.findAll({
      where: { id: user_id },
      attributes: [],
      include: [
        {
          model: Friendship,
          as: 'fromFriendship',
          where: { status: 'friend' },
          attributes: ['id', 'from_id', 'to_id', 'status'],
          include: [
            {
              model: User,
              as: 'toUser', // Use 'toUser' as the alias for the User model in the 'fromFriendship' association
              attributes: ['id', 'name', 'picture'],
            },
          ],
          required: false,
        },
        {
          model: Friendship,
          as: 'toFriendship',
          where: { status: 'friend' },
          attributes: ['id', 'from_id', 'to_id', 'status'],
          include: [
            {
              model: User,
              as: 'fromUser', // Use 'fromUser' as the alias for the User model in the 'toFriendship' association
              attributes: ['id', 'name', 'picture'],
            },
          ],
          required: false,
        },
      ],
      required: false,
    });

    const result = [];

    // Loop through the 'fromFriendship' associations and add the friend's info to the result array
    if (friends.fromFriendship.length > 0) {
      for (const friend of friends.fromFriendship) {
        let userObj = {};
        userObj.id = friend.toUser.id;
        userObj.name = friend.toUser.name;
        userObj.picture = friend.toUser.picture;
        userObj.friendship = {
          id: friend.id,
          status: friend.status,
        };
        result.push(userObj);
      }
    }

    // Loop through the 'toFriendship' associations and add the friend's info to the result array
    if (friends.toFriendship.length > 0) {
      for (const friend of friends.toFriendship) {
        let userObj = {};
        userObj.id = friend.fromUser.id;
        userObj.name = friend.fromUser.name;
        userObj.picture = friend.fromUser.picture;
        userObj.friendship = {
          id: friend.id,
          status: friend.status,
        };
        result.push(userObj);
      }
    }

    const responseData = {
      users: result,
    };

    // Send the response with the formatted users data
    res.status(200).json({ data: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
