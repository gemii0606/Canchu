const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Friendship = require('../utils/model/friendships');

// take out the function
const { checkAuthorization } = require('../utils/function');

// set the connection with mysql server
const pool = require('../utils/mysql');


router.post('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const from_id = decodedToken.id;

    
    
    const friendshipInfo = await User.findByPk(friendship.id);
    return res.status(200).json({ data: { friendship: friendshipInfo } });

});