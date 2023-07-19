const express = require('express');
const router = express.Router();

const eventGetRoute = require('./get_event');
const eventReadRoute = require('./read_event');



router.use('/:event_id/read', eventReadRoute);
router.use('/', eventGetRoute);

module.exports = router;