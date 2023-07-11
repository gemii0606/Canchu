const express = require('express');
const router = express.Router();

const friendsRequestRoute = require('./friends_request');
const friendsPendingRoute = require('./friends_pending');
const friendsAgreeRoute = require('./friends_agree');

router.use('/:user_id/request', friendsRequestRoute);
router.use('/pending', friendsPendingRoute);
router.use('/:friendship_id/agree', friendsAgreeRoute);

module.exports = router;