const express = require('express');
const router = express.Router();
const {Post, Like} = require('../utils/models/model');
const Redis = require('ioredis');
const redisClient = new Redis();


// take out the function
const { checkAuthorization } = require('../utils/function');

router.post('/', checkAuthorization, async (req, res) => {
    const post_id = req.baseUrl.split('/').slice(-2,-1)[0];
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver
    
    const find_post = await Post.findOne({
        where: {
            id: post_id
        },
        attributes: ['id']
    });

    if (!find_post) {
        return res.status(400).json({error: 'Post does not exist.'});
    }

    const find_like = await Like.findOne({
        where: {
            post_id,
            liker_id: user_id
        }        
    });

    if (find_like) {
        return res.status(400).json({error: 'You have already like it.'});
    }

    const cr_like = await Like.create({
        post_id,
        liker_id: user_id
    });

    const post = {
        id: post_id
    };

    const deleteKey = `post:${post.id}`;
    await redisClient.del(deleteKey);

    return res.status(200).json({ data: { post } });
});

router.delete('/', checkAuthorization, async (req, res) => {
    const post_id = req.baseUrl.split('/').slice(-2,-1)[0];
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver
    
    const find_post = await Like.findOne({
        where: {
            post_id: post_id,
            liker_id: user_id
        },
        attributes: ['id']
    });

    if (!find_post) {
        return res.status(400).json({error: 'You have not like this post.'});
    }

    const delete_action = await Like.destroy({
        where: { 
            id: find_post.id,
        }
    });

    const post = {
        id: post_id
    };

    const deleteKey = `post:${post.id}`;
    const likePostKey = `user:${user_id}:post:${post_id}:like`;
    await redisClient.del(deleteKey);
    await redisClient.del(likePostKey);

    return res.status(200).json({ data: { post } });
});

module.exports = router;