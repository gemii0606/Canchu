const express = require('express');
const router = express.Router();

const createPostRoute = require('./create_post');
const updatePostRoute = require('./update_post');
const likePostRoute = require('./like_post');
const commentPostRoute = require('./comment_post');

router.use('/:id/comment', commentPostRoute);
router.use('/:id/like', likePostRoute);
router.use('/:id', updatePostRoute);
router.use('/', createPostRoute);


module.exports = router;