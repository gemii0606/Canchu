const express = require('express');
const router = express.Router();
const { passReqparams } = require('../utils/function');
const friendRequestRoute = require('./friends_request');
// const friendAgreeRoute = require('./friends_agree');

router.use('/:user_id/request', passReqparams, friendRequestRoute);

// router.post('/friends/:friendship_id/agree', friendAgreeRoute);


module.exports = router;