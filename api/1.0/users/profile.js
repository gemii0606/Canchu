const express = require('express');
const {User, Friendship} = require('../utils/models/model');
const { Op } = require('sequelize');
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');
  
router.get('/', checkAuthorization, async (req, res) => {
  // if the authorization passes, user can see others profile
    try {
      // taken id from its baseUrl property, if /:id/profile, then :id should be in the -2 position
      const reqId = req.baseUrl.split('/').slice(-2,-1)[0];
      const userId = parseInt(reqId);
      const decodedToken = req.decodedToken;
      const id = decodedToken.id;  // see if you are receiver

      const userInfo = await User.findAll({
        where: {
            id: userId
        },
        attributes: ['id', 'name', 'picture', 'introduction', 'tags'],
        include: [
          {
            model: Friendship,
            as: 'fromFriendship',
            where:{from_id: id},
            attributes: ['id', 'status'],
            required: false
          },
          {
            model: Friendship,
            as: 'toFriendship',
            where:{to_id: id},
            attributes: ['id', 'status'],
            required: false
          }
        ],
        required: false
      });
      console.log(userInfo)
      // if (userInfo.fromFriendship)

      // const result = [];
      
      // if (userInfo.fromFriendship.length > 0) {
      //   for (const friend of userInfo.fromFriendship) {
      //     let userObj = {};
      //     userObj.id = friend.toUser.id;
      //     userObj.name = friend.toUser.name;
      //     userObj.picture = friend.toUser.picture;
      //     userObj.friendship = { 
      //       id: friend.id,
      //       status: friend.status
      //     };
      //     result.push(userObj);
      //     }
      // } 
      
      // if (userInfo.toFriendship.length > 0) {
      //   for (const friend of userInfo.toFriendship) {
      //     let userObj = {
      //       id: friend.id,
      //       status: friend.status
      //     };
      //     result.push(userObj);
      //   }
      // }

      const user = {
          id: userInfo.id,
          name: userInfo.name,
          picture: userInfo.picture,
          friend_count: 1,
          introduction: userId.introduction,
          tags: userInfo.tags,
          friendship: {
            id: 1,
            status: "requested"
          }
      };

      return res.status(200).json({ data: {user} });

    } catch (err) {
        console.error(`${err.message} `);
        return res.status(500).json({ error: 'Server error' });
    }
 });

module.exports = router;
