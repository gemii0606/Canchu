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


    const query_users = await User.findAll({
      where: {
        id: {
          [Op.not]: user_id
        },
        name: {
          [Op.like]: `%${keyword}%`
        }
      },
      attributes: ['id', 'name', 'picture']
    });

    let users = [];

    for (const other of query_users) {
      console.log(other.id)

      const friendship = await Friendship.findAll({
        where: {
          [Op.or]: [
            { [Op.and]: [{ from_id: user_id }, { to_id: other.id }] },
            { [Op.and]: [{ from_id: other.id }, { to_id: user_id }] }
          ]
        }
      });    
      console.log(friendship);
      if (!friendship) {
        const data = {
          id: other.dataValues.id,
          name: other.dataValues.name,
          picture: other.dataValues.picture,
          friendship: null
        };
        users.push(data);
        continue;
      } else if ( friendship.dataValues.from_id === user_id && friendship.dataValues.status === 'pending') {
        const data = {
          id: other.dataValues.id,
          name: other.dataValues.name,
          picture: other.dataValues.picture,
          friendship: {
            id: friendship.dataValues.id,
            status: 'requested'
          }
        };
        users.push(data);
      } else if ( friendship.dataValues.to_id === user_id && friendship.dataValues.status === 'pending') {
        const data = {
          id: other.dataValues.id,
          name: other.dataValues.name,
          picture: other.dataValues.picture,
          friendship: {
            id: friendship.dataValues.id,
            status: 'pending'
          }
        };
        users.push(data);
      } else if ( friendship.dataValues.status === 'friend') {
        const data = {
          id: other.dataValues.id,
          name: other.dataValues.name,
          picture: other.dataValues.picture,
          friendship: {
            id: friendship.dataValues.id,
            status: 'friend'
          }
        };
        users.push(data);
      }
    }
    return res.status(200).json({data: {users: users}});
});

module.exports = router;