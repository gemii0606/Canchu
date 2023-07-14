const express = require('express');
const router = express.Router();
const {User, Post, Like, Comment} = require('../utils/models/model');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    const post_id = req.baseUrl.split('/').slice(-1);
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver
    const {context} = req.body;

    if (!context) {
        return res.status(400).json({error: 'Please write something and post.'});
    }

    const find_post = await Post.findOne({
        where: {
            id: post_id
        },
        attributes: ['id', 'user_id', 'context']
    });

    if (user_id !== find_post.user_id) {
        return res.status(400).json({error: 'You are not the post owner!'});
    }

    find_post.context =  context;
    await find_post.save();

    const post = {
        id: find_post.id
    };

    return res.status(200).json({ data: { post } });
});


module.exports = router;