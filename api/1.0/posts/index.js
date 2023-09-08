const express = require('express');
const router = express.Router();

// Import custom middleware and controllers
const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { postCreate, postComment, postLike, postLikeDelete, postSearch, postUpdate, postDetail, testpost } = require('../controller/posts_controller')

// Search for posts
router.get('/search', checkAuthorization, async (req, res) => {ErrorHandling(postSearch(req, res), res)});

// Add a comment to a post
router.post('/:id/comment', checkAuthorization, async (req, res) => {ErrorHandling(postComment(req, res), res)});

// Like a post
router.post('/:id/like', checkAuthorization, async (req, res) => {ErrorHandling(postLike(req, res), res)});

// Remove a like from a post
router.delete('/:id/like', checkAuthorization, async (req, res) => {ErrorHandling(postLikeDelete(req, res), res)});

// Get details of a specific post
router.get('/:id', checkAuthorization, async (req, res) => {ErrorHandling(postDetail(req, res), res)});

// Update a post
router.put('/:id', checkAuthorization, async (req, res) => {ErrorHandling(postUpdate(req, res), res)});

// Create a new post
router.post('/', checkAuthorization, async (req, res) => {ErrorHandling(postCreate(req, res), res)});

// for K6 testing, not for post API
router.post('/test', checkAuthorization, async (req, res) => {ErrorHandling(testpost(req, res), res)});

module.exports = router;