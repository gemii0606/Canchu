const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');
const Event = require('../utils/model/events');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    try {
        const reqFriendshipId = req.baseUrl.split('/').slice(-2,-1)[0];
        const decodedToken = req.decodedToken;
        const user_id = decodedToken.id;
        const friendship_id = parseInt(reqFriendshipId); // friendships table's id

        const friendship = await Friendship.findOne({
            where: { id: friendship_id }
        });

        if (friendship.status === 'friend') {
            return res.status(400).json({ error: 'You are already friends.' });
        }

        if (friendship.from_id === user_id) {
            return res.status(400).json({ error: 'You are not the receiver.' });
        }

        friendship.status = 'friend';
        await friendship.save(); // to save this change permanently

        // create accept event in events table 
        const accept_event = await User.findOne({
            where: { id: friendship.from_id },
            attributes: ['id', 'name']
        });

        console.log(accept_event.dataValues.name);
        const events = await Event.create({
            from_id: accept_event.dataValues.id,
            to_id: user_id,
            type:'friend_accept',
            is_read: false,
            summary: `${accept_event.dataValues.name} has accepted your friend request.`
        });


        return res.status(200).json({ data: {friendship: {id: friendship.id} } });
    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }

});

module.exports = router;