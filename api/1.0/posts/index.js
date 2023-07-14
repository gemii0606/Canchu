const express = require('express');
const router = express.Router();

const createPostRoute = require('./create_post');
const updatePostRoute = require('./update_post');

router.use('/:id', updatePostRoute);
router.use('/', createPostRoute);


module.exports = router;