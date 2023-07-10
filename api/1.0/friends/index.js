const express = require('express');
const router = express.Router();
const friendRequestRoute = require('./friends_request');
// const friendAgreeRoute = require('./friends_agree');

router.post('/:user_id/request', friendRequestRoute);
// router.post('/friends/:friendship_id/agree', friendAgreeRoute);


module.exports = router;