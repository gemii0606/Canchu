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
      // const usersWithFriendships = users.map(user => {
      //   const friendship = {
      //     id: null,
      //     status: null
      //   };
      
      //   // 提取 outgoingFriendships 中的友誼信息
      //   if (user.outgoingFriendships.length > 0) {
      //     friendship.id = user.outgoingFriendships[0].id;
      //     friendship.status = user.outgoingFriendships[0].status;
      //   }
      
      //   // 提取 incomingFriendships 中的友誼信息
      //   if (user.incomingFriendships.length > 0) {
      //     friendship.id = user.incomingFriendships[0].id;
      //     friendship.status = user.incomingFriendships[0].status;
      //   }
      
      //   return {
      //     id: user.id,
      //     name: user.name,
      //     picture: user.picture,
      //     friendship: friendship
      //   };
      // });
      
      // const response = {
      //   data: {
      //     users: usersWithFriendships
      //   }
      // };

      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }

    
});

module.exports = router;