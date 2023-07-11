const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.delete('/', checkAuthorization, async (req, res) => {
    try {
        const reqFriendshipId = req.baseUrl.split('/').slice(-1);
        const decodedToken = req.decodedToken;
        const user_id = decodedToken.id;
        const delete_id = parseInt(reqFriendshipId); // friendships table's id

        const delete_target = await Friendship.findOne({
            where: { id: delete_id }
        });

        if (!delete_target) {
            return res.status(400).json({ error: 'No relationship is found.' });
        }

        if (delete_target.to_id === user_id && delete_target.status === 'pending') {
            return res.status(400).json({ error: 'Your relationship has not connected.' });
        }

        if (delete_target.status === 'friend') {

            const delete_action = await Friendship.destroy({
                where: { id: delete_id }
            });
    
            return res.status(200).json({ data: {friendship: delete_id}});
            
        }


    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }

});

module.exports = router;