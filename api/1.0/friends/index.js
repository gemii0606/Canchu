const express = require('express');
const router = express.Router();

const friendsRequestRoute = require('./friends_request');
const friendsPendingRoute = require('./friends_pending');

router.use('/:user_id/request', friendsRequestRoute);
router.use('/pending', friendsPendingRoute);

module.exports = router;