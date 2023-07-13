const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');

router.get('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    console.log(req.query);
    const { keyword } = req.query;

    const users = await User.findAll({
      where: {
        name: {
          [Sequelize.Op.like]: `%${keyword}%`
        }
      },
      include: [{
        model: Friendship,
        required: false
      }]
    });

    res.send('ok');
});

module.exports = router;