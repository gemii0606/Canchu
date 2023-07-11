const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const to_id = decodedToken.id;  // see if you are receiver
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

});

module.exports = router;