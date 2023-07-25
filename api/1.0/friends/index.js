const express = require('express');
const router = express.Router();

// const friendsRequestRoute = require('./friends_request');
const friendsPendingRoute = require('./friends_pending');
const friendsAgreeRoute = require('./friends_agree');
const friendsDeleteRoute = require('./friends_delete');
const friendsRoute = require('./friends_get');


const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { friendRequest } = require('../controller/friends_controller')

router.post('/:user_id/request', checkAuthorization, async (req, res) => {ErrorHandling(friendRequest(req, res), res)});

// router.use('/:user_id/request', friendsRequestRoute);
router.use('/pending', friendsPendingRoute);
router.use('/:friendship_id/agree', friendsAgreeRoute);
router.use('/:friendship_id', friendsDeleteRoute);
router.use('/', friendsRoute);

module.exports = router;