const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

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

        if (!friendship) {
            return res.status(400).json({ error: 'There is no request.' });
        }

        if (friendship.status === 'requested') {
            return res.status(400).json({ error: 'You are already friends.' });
        }

        if (friendship.from_id === user_id) {
            return res.status(400).json({ error: 'You are not the receiver.' });
        }

        friendship.status = 'requested';
        return res.status(200).json({ data: {friendship: friendship_id}});
    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }

});

module.exports = router;