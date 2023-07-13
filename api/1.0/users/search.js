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


    const users = await User.findAll({
      where: {
        name: {
          [Op.like]: `%${keyword}%`
        }
      },
      attributes: ['id', 'name', 'picture']
    });

    console.log(users);

    const friendship = await Friendship.findAll({
      where: {
        [Op.or]: [
          { from_id: user_id },
          { to_id: user_id }
        ]
      }
    });

    console.log(friendship);
    return res.send('ok');
    // return res.status(200).json({data: });
});

module.exports = router;