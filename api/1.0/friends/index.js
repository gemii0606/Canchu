const express = require('express');
const router = express.Router();

// Import custom middleware and controllers
const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { friendRequest, friendPending, friendGet, friendAgree, friendDelete } = require('../controller/friends_controller')

// Handle a friend request by sending one
router.post('/:user_id/request', checkAuthorization, (req, res) => {ErrorHandling(friendRequest(req, res), res)});

// Get pending friend requests
router.get('/pending', checkAuthorization, (req, res) => {ErrorHandling(friendPending(req, res), res)});

// Agree to a friend request
router.post('/:friendship_id/agree', checkAuthorization, (req, res) => {ErrorHandling(friendAgree(req, res), res)});

// Delete a friend from the list
router.delete('/:friendship_id', checkAuthorization, (req, res) => {ErrorHandling(friendDelete(req, res), res)});

// Get the list of friends
router.get('/', checkAuthorization, (req, res) => {ErrorHandling(friendGet(req, res), res)});

module.exports = router;