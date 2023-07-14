const express = require('express');
const router = express.Router();
const {User, Post, Like, Comment} = require('../utils/models/model');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver
    const {context} = req.body;

    if (!context) {
        return res.status(400).json({error: 'Please write something and post.'});
    }

    const cr_post = await Post.create({
        user_id,
        context
    });

    const post = {
        id: cr_post.id
    };

    return res.status(200).json({ data: { post } });
});


module.exports = router;