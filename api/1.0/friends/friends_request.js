const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');

// set the connection with mysql server
const pool = require('../utils/mysql');


router.post('/', checkAuthorization, async (req, res) => {
    const reqUserId = req.baseUrl.split('/').slice(-2,-1)[0];
    const decodedToken = req.decodedToken;
    console.log(decodedToken);
    console.log(reqUserId);
    const from_id = decodedToken.id;
    const to_id = parseInt(reqUserId);

    const user = await User.findOne({
        where: { id: to_id }
      });
      
    if (!user) {
    return res.status(400).json({ error: 'User does not exist.' });
    }


    const AtoB = await Friendship.findOne({
        where: { from_id, to_id }
      });
    console.log('1');
    if (AtoB) {
    return res.status(400).json({ error: 'The request has already been sent.' });
    }
    console.log('2');
    const BtoA = await Friendship.findOne({
    where: { from_id, to_id }
    });
    console.log('3');
    if (BtoA && BtoA.status === 'pending') {
    return res.status(400).json({ error: 'He/She is waiting for your acceptance.' });
    }
    console.log('4');
    if (BtoA && BtoA.status === 'accepted') {
    return res.status(400).json({ error: 'You are already friends.' });
    }
    console.log('5');
    const friendship = await Friendship.create({
    from_id,
    to_id
    });
    
    const friendshipInfo = await User.findByPk(friendship.id);
    console.log('6');
    return res.status(200).json({ data: { friendship: friendshipInfo } });

});

module.exports = router;