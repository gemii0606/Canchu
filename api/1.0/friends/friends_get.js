const express = require('express');
const router = express.Router();
const {User, Friendship, Event} = require('../utils/models/model');
const { Op } = require('sequelize');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver

    // const users = await Friendship.findAll({
    //     where: {
    //       [Op.and]: [
    //         { [Op.or]: [{ from_id: user_id }, { to_id: user_id }] },
    //         { status: 'friend' }
    //       ]
    //     }
    //   });
    const users = await User.findAll({
        attributes: ['id', 'name', 'picture'],
        include: [
          {
            model: Friendship,
            attributes: ['id', 'status']
          }
        ]
      });
      console.log(users[0].include);
    
});

module.exports = router;