const express = require('express');
const router = express.Router();

const createPostRoute = require('./create_post');


router.use('/', createPostRoute);


module.exports = router;