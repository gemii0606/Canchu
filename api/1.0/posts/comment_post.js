const express = require('express');
const router = express.Router();
const {Post, Like, Comment} = require('../utils/models/model');

// take out the function
const { checkAuthorization } = require('../utils/function');

router.post('/', checkAuthorization, async (req, res) => {
    const post_id = req.baseUrl.split('/').slice(-2,-1)[0];
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver
    const {content} = req.body;

    const cr_comment = await Comment.create({
        post_id,
        commenter_id: user_id,
        content
    });

    const post = {
        id: post_id
    };
    const comment = {
        id: cr_comment.id
    };
    return res.status(200).json({ data: { post, comment } });

});

module.exports = router;