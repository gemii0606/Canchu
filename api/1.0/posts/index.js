const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ErrorHandling, checkAuthorization } = require('../utils/function');
const { postCreate, postComment, postLike, postLikeDelete, postSearch, postUpdate, postDetail } = require('../controller/posts_controller')

router.get('/search', checkAuthorization, async (req, res) => {ErrorHandling(postSearch(req, res), res)});
router.post('/:id/comment', checkAuthorization, async (req, res) => {ErrorHandling(postComment(req, res), res)});
router.post('/:id/like', checkAuthorization, async (req, res) => {ErrorHandling(postLike(req, res), res)});
router.delete('/:id/like', checkAuthorization, async (req, res) => {ErrorHandling(postLikeDelete(req, res), res)});
router.get('/:id', checkAuthorization, async (req, res) => {ErrorHandling(postDetail(req, res), res)});
router.put('/:id', checkAuthorization, async (req, res) => {ErrorHandling(postUpdate(req, res), res)});
router.post('/', checkAuthorization, async (req, res) => {ErrorHandling(postCreate(req, res), res)});

router.post('/test5000', async (req, res) => {
    for (let i = 0; i <= 5000; i++) {
        const requestData = JSON.stringify({context: i});
        const response = await axios.post('https://13.210.26.62/api/1.0/posts', requestData);
        console.log(`POST request ${i} status: ${response.status}`);

    }
});

module.exports = router;