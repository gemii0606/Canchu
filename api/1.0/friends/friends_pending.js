const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const to_id = decodedToken.id;  // see if you are receiver
    const friendships_info = await Friendship.findOne({
        where: { to_id, status: 'pending' }
      });

    const friendships_pending = friendships_info.dataValues;

    console.log(friendships_pending)
    
    return res.status(200).json({ok: 'ok'});

});

module.exports = router;