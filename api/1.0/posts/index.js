const express = require('express');
const router = express.Router();

const createPostRoute = require('./create_post');
const updateDetailPostRoute = require('./update_detail_post');
const likePostRoute = require('./like_post');
const commentPostRoute = require('./comment_post');
const searchPostRoute = require('./search_post');

router.use('/search', searchPostRoute);
router.use('/:id/comment', commentPostRoute);
router.use('/:id/like', likePostRoute);
router.use('/:id', updateDetailPostRoute);
router.use('/', createPostRoute);


module.exports = router;