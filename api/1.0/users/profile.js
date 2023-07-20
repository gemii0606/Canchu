const express = require('express');
const {User, Friendship} = require('../utils/models/model');
const { Op } = require('sequelize');
const Redis = require('ioredis');
const redisClient = new Redis();
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');
  
router.get('/', checkAuthorization, async (req, res) => {
  // if the authorization passes, user can see others profiles
    try {
      // taken id from its baseUrl property, if /:id/profile, then :id should be in the -2 position
      const reqId = req.baseUrl.split('/').slice(-2,-1)[0];
      const userId = parseInt(reqId);
      const decodedToken = req.decodedToken;
      const id = decodedToken.id;  // see if you are receiver
      
      // search for the redis
      const userProfileKey = `user:${userId}:profile`;
      const userProfile = await redisClient.get(userProfileKey);
      
      const userFriendshipKey = `user:${userId}:friendship:${id}`;
      const userFriendship = await redisClient.get(userFriendshipKey);

      let userInfo;
      let friend_count;
      if (userProfile) {
        // If user profile exists in Redis, use it directly
        userInfo = JSON.parse(userProfile);
      } else {
        // get user's info and check if you are his friend
        userInfo = await User.findOne({
          where: { id: userId },
          attributes: ['id', 'name', 'picture', 'introduction', 'tags'],
          include: [
            {
              model: Friendship,
              as: 'fromFriendship',
              where:{to_id: id},
              attributes: ['id', 'status'],
              required: false
            },
            {
              model: Friendship,
              as: 'toFriendship',
              where:{from_id: id},
              attributes: ['id', 'status'],
              required: false
            }
          ],
          required: false
        });

      // count the user's friend
      const { rows, count } = await Friendship.findAndCountAll({
        where:{
          [Op.or]: [{from_id: userId}, {to_id: userId}],
          status: 'friend'
        }
      });

      friend_count = count;
    }

    // set the friendship info
    let friendship = null; 
    if (userFriendship) {
      // if info in redis, use it directly
      friendship = JSON.parse(userFriendship);
    } else {
      // search the db if redis does not have
      friend_result = await User.findOne({
        where: { id: userId },
        attributes: [],
        include: [
          {
            model: Friendship,
            as: 'fromFriendship',
            where:{to_id: id},
            attributes: ['id', 'status'],
            required: false
          },
          {
            model: Friendship,
            as: 'toFriendship',
            where:{from_id: id},
            attributes: ['id', 'status'],
            required: false
          }
        ],
        required: false
      });

      // determine the relationship
      if (friend_result.toFriendship.length > 0) {
        friendship = friend_result.toFriendship[0].dataValues;
        if (friendship.status !== 'friend') {
          friendship.status = 'requested';
        }
      } else if (friend_result.fromFriendship.length > 0) {
        friendship = friend_result.fromFriendship[0].dataValues;
      }
    }

    const user_profile = {
      id: userInfo.id,
      name: userInfo.name,
      picture: userInfo.picture,
      friend_count: friend_count,
      introduction: userInfo.introduction,
      tags: userInfo.tags,
    }
    
    const user = {
          ...user_profile,
          friendship: friendship
      };
      
      // store the info in redis
      await redisClient.setex(userProfileKey, 3600, JSON.stringify(user_profile));
      await redisClient.setex(userFriendshipKey, 3600, JSON.stringify(friendship));

      return res.status(200).json({ data: {user} });

    } catch (err) {
        console.error(`${err.message} `);
        return res.status(500).json({ error: 'Server error' });
    }
 });

module.exports = router;
