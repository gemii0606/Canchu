const express = require('express');
const router = express.Router();

const friendsRequestRoute = require('./friends_request');
const friendsAgreeRoute = require('./friends_agree');

router.get('/:user_id/request', friendsRequestRoute);
router.get('/:friendship_id/agree', friendsRequestRoute);

module.exports = router;