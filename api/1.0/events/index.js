const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { eventGet, eventRead } = require('../controller/events_controller')


router.post('/:event_id/read', checkAuthorization, (req, res) => {ErrorHandling(eventRead(req, res), res)});
router.get('/', checkAuthorization, (req, res) => {ErrorHandling(eventGet(req, res), res)});

module.exports = router;