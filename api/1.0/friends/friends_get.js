const express = require('express');
const router = express.Router();
const {User, Friendship, Event} = require('../utils/models/model');
const { Op } = require('sequelize');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {
    console.log('1');
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver

    try {
      const users = await User.findAll({
        where: { id: user_id },
        attributes: ['id', 'name', 'picture'],
        include: [
          {
            model: Friendship,
            as: 'outgoingFriendships',
            attributes: ['id', 'from_id', 'to_id', 'status'],
            include: [
              {
                model: User,
                as: 'toUser',
                attributes: ['id', 'name', 'picture']
              }
            ]
          },
          {
            model: Friendship,
            as: 'incomingFriendships',
            attributes: ['id', 'from_id', 'to_id', 'status'],
            include: [
              {
                model: User,
                as: 'fromUser',
                attributes: ['id', 'name', 'picture']
              }
            ]
          }
        ]
      });
      console.log(users);
      console.log(users[0].Friendships);
      res.status(200).json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }

    
});

module.exports = router;