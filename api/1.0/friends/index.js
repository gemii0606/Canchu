const express = require('express');
const router = express.Router();

const friendsRequestRoute = require('./friends_request');
const friendsPendingRoute = require('./friends_pending');
const friendsAgreeRoute = require('./friends_agree');
const friendsDeleteRoute = require('./friends_delete');

router.use('/:user_id/request', friendsRequestRoute);
router.use('/pending', friendsPendingRoute);
router.use('/:friendship_id/agree', friendsAgreeRoute);
router.use('/:friendship_id', friendsDeleteRoute);

module.exports = router;