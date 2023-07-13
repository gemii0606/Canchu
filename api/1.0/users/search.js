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

    for (const item of query_users) {
      const friendship = await Friendship.findAll({
        where: {
          [Op.or]: [
            { from_id: user_id },
            { to_id: user_id }
          ]
        }
      });
    
      if ( friendship.status === 'pending') {
        const data = {
          id: item.id,
          name: item.name,
          picture: item.picture,
          friendship: {
            id: friendship.id,
            status: friendship.status
          }
        };
        users.push(data);
      } else if ( friendship.status === 'friend') {
        const data = {
          id: item.id,
          name: item.name,
          picture: item.picture,
          friendship: {
            id: friendship.id,
            status: friendship.status
          }
        };
        users.push(data);
      } else {
        const data = {
          id: item.id,
          name: item.name,
          picture: item.picture,
          friendship: null
        };
        users.push(data);
      }
    }



    console.log(users);


    return res.send('ok');
    // return res.status(200).json({data: });
});

module.exports = router;