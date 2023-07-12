const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');
const Event = require('../utils/model/events');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    try {
        //get the user id
        const reqUserId = req.baseUrl.split('/').slice(-2,-1)[0];
        const decodedToken = req.decodedToken;
        const from_id = decodedToken.id;
        const to_id = parseInt(reqUserId);

        const user = await User.findOne( { where: { id: to_id } } );
        
        if (!user) {
            return res.status(400).json({ error: 'User does not exist.' });
        }

        const AtoB = await Friendship.findOne( { where: { from_id, to_id } } );
    
        if (AtoB) {
            return res.status(400).json({ error: 'The request has already been sent.' });
        }

        const BtoA = await Friendship.findOne( { where: { from_id, to_id } } );
    
        if (BtoA && BtoA.status === 'pending') {
            return res.status(400).json({ error: 'He/She is waiting for your acceptance.' });
        }
    
        if (BtoA && BtoA.status === 'accepted') {
            return res.status(400).json({ error: 'You are already friends.' });
        }
        // create friendship in friendships table
        const friendship = await Friendship.create({
            from_id,
            to_id
        });
        
        // create request event in events table
        const request_event = await User.findOne({
            where: { id: from_id },
            attributes: ['name']
        });
        console.log(request_event.dataValues.name);
        const events = await Event.create({
            from_id,
            to_id,
            type:'friend_request',
            is_read: false,
            summary: `${request_event.dataValues.name}邀請你成為好友`
        });
        
        return res.status(200).json({ data: { friendship: {id: friendship.id} } });

    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }

});

module.exports = router;