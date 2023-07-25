const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { friendRequest, friendPending, friendGet, friendAgree, friendDelete } = require('../controller/friends_controller')

router.post('/:user_id/request', checkAuthorization, (req, res) => {ErrorHandling(friendRequest(req, res), res)});
router.get('/pending', checkAuthorization, (req, res) => {ErrorHandling(friendPending(req, res), res)});
router.post('/:friendship_id/agree', checkAuthorization, (req, res) => {ErrorHandling(friendAgree(req, res), res)});
router.delete('/:friendship_id', checkAuthorization, (req, res) => {ErrorHandling(friendDelete(req, res), res)});
router.get('/', checkAuthorization, (req, res) => {ErrorHandling(friendGet(req, res), res)});

module.exports = router;