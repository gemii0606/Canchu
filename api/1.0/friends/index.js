const express = require('express');
const router = express.Router();
const friendRequestRoute = require('../friends/friends_request');
// const friendAgreeRoute = require('./friends_agree');

router.post('/friends/:user_id/request', friendRequestRoute);
// router.post('/friends/:friendship_id/agree', friendAgreeRoute);


module.exports = router;