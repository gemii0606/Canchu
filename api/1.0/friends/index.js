const express = require('express');
const router = express.Router();

// const friendsRequestRoute = require('./friends_request');
// const friendsPendingRoute = require('./friends_pending');
// const friendsAgreeRoute = require('./friends_agree');
// const friendsDeleteRoute = require('./friends_delete');
// const friendsRoute = require('./friends_get');


const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { friendRequest, friendPending, friendGet, friendAgree, friendDelete } = require('../controller/friends_controller')

router.post('/:user_id/request', checkAuthorization, async (req, res) => {ErrorHandling(friendRequest(req, res), res)});
router.get('/pending', checkAuthorization, async (req, res) => {ErrorHandling(friendPending(req, res), res)});
router.post('/:friendship_id/agree', checkAuthorization, async (req, res) => {ErrorHandling(friendAgree(req, res), res)});
router.delete('/:friendship_id', checkAuthorization, async (req, res) => {ErrorHandling(friendDelete(req, res), res)});
router.get('/', checkAuthorization, async (req, res) => {ErrorHandling(friendGet(req, res), res)});


// router.use('/:user_id/request', friendsRequestRoute);
// router.use('/pending', friendsPendingRoute);
// router.use('/:friendship_id/agree', friendsAgreeRoute);
// router.use('/:friendship_id', friendsDeleteRoute);
// router.use('/', friendsRoute);

module.exports = router;