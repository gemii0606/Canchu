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
      const friends = await User.findAll({
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
      console.log(friends);

      const result = [];
      for (const friend of friends) {
        let userObj = {};
      
        if (friend.fromFriendship.length > 0) {
          userObj.id = friend.fromFriendship.toUser.id;
          userObj.name = friend.fromFriendship.toUser.name;
          userObj.picture = friend.fromFriendship.toUser.picture;
          userObj.friendship = { 
            id: friend.fromFriendship.id,
            status: friend.status
          };
          result.push(userObj);
        } else if (friend.toFriendship.length > 0) {
          userObj.id = friend.toFriendship.toUser.id;
          userObj.name = friend.toFriendship.toUser.name;
          userObj.picture = friend.toFriendship.toUser.picture;
          userObj.friendship = { 
            id: friend.fromFriendship.id,
            status: friend.status
          };
          result.push(userObj);
        }
      
      
      const responseData = {
        users: result
      };
    }
      res.status(200).json(friends);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }

    
});

module.exports = router;