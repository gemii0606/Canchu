const express = require('express');
const router = express.Router();

// Import custom middleware and controllers
const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { eventGet, eventRead } = require('../controller/events_controller')

// Mark an event as read
router.post('/:event_id/read', checkAuthorization, (req, res) => {ErrorHandling(eventRead(req, res), res)});

// Get a list of events
router.get('/', checkAuthorization, (req, res) => {ErrorHandling(eventGet(req, res), res)});

module.exports = router;