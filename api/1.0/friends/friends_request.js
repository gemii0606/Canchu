const express = require('express');
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');

// set the connection with mysql server
const pool = require('../utils/mysql');


router.post('/', checkAuthorization, async (req, res) => {
    const reqUserId = req.baseUrl.split('/').slice(-2,-1)[0];
    const decodedToken = req.decodedToken;
    console.log(decodedToken);
    console.log(reqUserId);
    const user_id = decodedToken.id;
    const request_id = parseInt(reqUserId);

    const [selectUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [request_id]);
    if (selectUsers.length === 0) {
        return res.status(400).json({error: 'User does not exist.'});
    }


    const [AtoB] = await pool.query('SELECT * FROM friendships WHERE user_id = ? AND friend_id = ?', [user_id, request_id]);
    if (AtoB !== 0) {
        return res.status(400).json({error: 'The request has already sent'});
    }

    const [BtoA] = await pool.query('SELECT * FROM friendships WHERE friend_id = ? AND user_id = ?', [user_id, request_id]);
    if (BtoA[0].status === 'pending') {
        return res.status(400).json({error: 'He/She is waiting for your acceptance.'});
    }
    if (BtoA[0].status === 'accepted') {
        return res.status(400).json({error: 'You are friends already.'});
    }

    const [item] = await pool.query('INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)', [user_id, request_id, 'pending']);
    const [friendshipInfo] = await pool.query('SELECT * FROM users WHERE id = ?', [item.insertId])[0];
    const friendship = { id: friendshipInfo.id };
    return res.status(200).json({data: {friendship} });

});

module.exports = router;