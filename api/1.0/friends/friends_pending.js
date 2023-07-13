const express = require('express');
const router = express.Router();
const User = require('../utils/models/users');
const Friendship = require('../utils/models/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {
    try {
        const decodedToken = req.decodedToken;
        const to_id = decodedToken.id;  // see if you are receiver

        // get the pending info from friendships table, and drag the associated sender info from users table
        const friendships_info = await Friendship.findAll({
            where: { to_id, status: 'pending' },
            attributes: ['id', 'from_id', 'to_id'],
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture'],
                    as: 'FromUser'
                }
            ]
        });
        
        // data reform
        const users = friendships_info.map(friend =>{
            const user_info = friend.dataValues.FromUser.dataValues;
            const data ={
                ...user_info,
                friendship: {
                    id: friend.id,
                    status: 'pending'
                }
            };
            return data;
        });
    
        return res.status(200).json({data: {users}});
    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;