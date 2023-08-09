const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { postCreate, postComment, postLike, postLikeDelete, postSearch, postUpdate, postDetail } = require('../controller/posts_controller')

router.get('/search', checkAuthorization, async (req, res) => {ErrorHandling(postSearch(req, res), res)});
router.post('/:id/comment', checkAuthorization, async (req, res) => {ErrorHandling(postComment(req, res), res)});
router.post('/:id/like', checkAuthorization, async (req, res) => {ErrorHandling(postLike(req, res), res)});
router.delete('/:id/like', checkAuthorization, async (req, res) => {ErrorHandling(postLikeDelete(req, res), res)});
router.get('/:id', checkAuthorization, async (req, res) => {ErrorHandling(postDetail(req, res), res)});
router.put('/:id', checkAuthorization, async (req, res) => {ErrorHandling(postUpdate(req, res), res)});
router.post('/', checkAuthorization, async (req, res) => {ErrorHandling(postCreate(req, res), res)});

module.exports = router;