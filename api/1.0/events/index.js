const express = require('express');
const router = express.Router();

const eventGetRoute = require('./get_event');
const eventReadRoute = require('./read_event');

router.use('/', eventGetRoute);

router.use('/:event_id/read', eventReadRoute);


module.exports = router;