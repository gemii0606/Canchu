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
        attributes: [],
        include: [
          {
            model: Friendship,
            as: 'fromFriendship',
            where:{status: 'friend'},
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
            as: 'toFriendship',
            where:{status: 'friend'},
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
      const result = users.map(user => {
        const userObj = {
          id: user.id,
          name: user.name,
          picture: user.picture,
          friendship: null
        };
      
        if (user.fromFriendship.length > 0) {
          userObj.friendship = {
            id: user.fromFriendship[0].id,
            status: user.fromFriendship[0].status
          };
        } else if (user.toFriendship.length > 0) {
          userObj.friendship = {
            id: user.toFriendship[0].id,
            status: user.toFriendship[0].status
          };
        }
      
        return userObj;
      });
      
      const responseData = {
        users: result
      };

      res.status(200).json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }

    
});

module.exports = router;