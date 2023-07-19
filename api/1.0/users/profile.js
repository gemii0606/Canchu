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
      // console.log(req.baseUrl)

      // get user's info and check if you are his friend
      const userInfo = await User.findOne({
        where: {
            id: userId
        },
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

      let friendship = null;
      if (userInfo.fromFriendship.length > 0) {
        friendship = userInfo.fromFriendship[0].dataValues;
        if (friendship.status !== 'friend') {
          friendship.status = 'requested';
        }
      } else if (userInfo.toFriendship.length > 0) {
        friendship = userInfo.fromFriendship[0].dataValues;
      }

      // count the user's friend
      const { rows, count } = await Friendship.findAndCountAll({
        where:{
          [Op.or]: [{from_id: userId}, {to_id: userId}],
          status: 'friend'
        }
      });

      const user = {
          id: userInfo.id,
          name: userInfo.name,
          picture: userInfo.picture,
          friend_count: count,
          introduction: userId.introduction,
          tags: userInfo.tags,
          friendship: friendship
      };
      console.log(user)
      return res.status(200).json({ data: {user} });

    } catch (err) {
        console.error(`${err.message} `);
        return res.status(500).json({ error: 'Server error' });
    }
 });

module.exports = router;
