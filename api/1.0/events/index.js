const express = require('express');
const router = express.Router();

const eventGetRoute = require('./get_event');


router.use('/events', eventGetRoute);


module.exports = router;