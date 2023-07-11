const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    try {
        const reqUserId = req.baseUrl.split('/').slice(-2,-1)[0];
        const decodedToken = req.decodedToken;
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
    
        if (AtoB) {
            return res.status(400).json({ error: 'The request has already been sent.' });
        }

        const BtoA = await Friendship.findOne({
        where: { from_id, to_id }
        });
    
        if (BtoA && BtoA.status === 'pending') {
            return res.status(400).json({ error: 'He/She is waiting for your acceptance.' });
        }
    
        if (BtoA && BtoA.status === 'accepted') {
            return res.status(400).json({ error: 'You are already friends.' });
        }
    
        const friendship = await Friendship.create({
            from_id,
            to_id
        });
        
        const friendshipInfo = await User.findByPk(friendship.id);
        
        return res.status(200).json({ data: { friendship: friendshipInfo } });
    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }

});

module.exports = router;