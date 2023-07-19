const express = require('express');
const router = express.Router();
const {User, Friendship, Event} = require('../utils/models/model');

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
        console.log(friendship)
        // find the user's id and name 
        const accept_event = await User.findOne({
            where: { id: friendship.from_id },
            attributes: ['id', 'name']
        });

        // create accept event in events table. Note: when sending agree message, your are the sender.
        const events = await Event.create({
            from_id: user_id,
            to_id: accept_event.dataValues.id,
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