const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');
const { Op } = require('sequelize');

// take out the function
const { checkAuthorization } = require('../utils/function');

router.get('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    console.log(req.query);
    const { keyword } = req.query;

    const users = await User.findAll({
      where: {
        name: {
          [Op.like]: `%${keyword}%`
        }
      },
      include: [{
        model: Friendship,
        required: false
      }]
    });

    console.log(users);
    return res.send('ok');
    // return res.status(200).json({data: });
});

module.exports = router;