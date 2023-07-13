const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');
const { Op } = require('sequelize');

// take out the function
const { checkAuthorization } = require('../utils/function');

router.get('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const { keyword } = req.query;


    // const query_users = await User.findAll({
    //   where: {
    //     id: {
    //       [Op.not]: user_id
    //     },
    //     name: {
    //       [Op.like]: `%${keyword}%`
    //     }
    //   },
    //   attributes: ['id', 'name', 'picture']
    // });

    // let users = [];

    // for (const other of query_users) {
    //   const [friendship] = await Friendship.findAll({
    //     where: {
    //       [Op.or]: [
    //         { [Op.and]: [{ from_id: user_id }, { to_id: other.id }] },
    //         { [Op.and]: [{ from_id: other.id }, { to_id: user_id }] }
    //       ]
    //     }
    //   });    

    //   if (!friendship) {
    //     const data = {
    //       id: other.dataValues.id,
    //       name: other.dataValues.name,
    //       picture: other.dataValues.picture,
    //       friendship: null
    //     };
    //     users.push(data);
    //     continue;
    //   } else if ( friendship.dataValues.from_id === user_id && friendship.dataValues.status === 'pending') {
    //     const data = {
    //       id: other.dataValues.id,
    //       name: other.dataValues.name,
    //       picture: other.dataValues.picture,
    //       friendship: {
    //         id: friendship.dataValues.id,
    //         status: 'requested'
    //       }
    //     };
    //     users.push(data);
    //   } else if ( friendship.dataValues.to_id === user_id && friendship.dataValues.status === 'pending') {
    //     const data = {
    //       id: other.dataValues.id,
    //       name: other.dataValues.name,
    //       picture: other.dataValues.picture,
    //       friendship: {
    //         id: friendship.dataValues.id,
    //         status: 'pending'
    //       }
    //     };
    //     users.push(data);
    //   } else if ( friendship.dataValues.status === 'friend') {
    //     const data = {
    //       id: other.dataValues.id,
    //       name: other.dataValues.name,
    //       picture: other.dataValues.picture,
    //       friendship: {
    //         id: friendship.dataValues.id,
    //         status: 'friend'
    //       }
    //     };
    //     users.push(data);
    //   }
    // }

    const users = await User.findAll({
      attributes: [
        ['id', 'id'],
        ['Username', 'name'],
        ['Picture', 'picture'],
        [sequelize.literal(`CASE
            WHEN Friendship.user_id = ${user_id} AND Friendship.friend_id = Users.id THEN 'requested'
            WHEN Friendship.user_id = Users.id AND Friendship.friend_id = ${user_id} THEN 'pending'
          END`), 'friendship_status']
      ],
      include: {
        model: Friendship,
        required: false,
        attributes: []
      },
      where: {
        Username: {
          [Sequelize.Op.like]: `%${keyword}%`
        }
      },
      raw: true
    });

    return res.status(200).json({data: {users: users}});
});

module.exports = router;