const express = require('express');
const router = express.Router();
const {User, Post, Like, Comment} = require('../utils/models/model');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.put('/', checkAuthorization, async (req, res) => {
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

router.get('/', checkAuthorization, async (req, res) => {
    const search_post_id = req.baseUrl.split('/').slice(-1);
    const decodedToken = req.decodedToken;
    // const user_id = decodedToken.id;  // see if you are receiver
 
    const result_1 = await Post.findOne({
        where: { id: search_post_id },
        attributes: ['id', 'user_id', 'context', 'createdAt'],
        include: [
            {
                model: Like,
                as: 'postLike',
                attributes: ['id']
            },
            {
                model: Comment,
                as: 'postComment',
                attributes: ['id', 'commenter_id', 'content', 'createdAt']
            }
        ]
    });

    const result_2 = await User.findOne({
        where: { id: result_1.user_id },
        attributes: ['name', 'picture'],
    });

    const result_3 = await Like.findOne({
        where: { id: result_1.user_id, post_id: search_post_id}
    });

    const post_id = result_1.id;
    const post_created_at = result_1.createdAt;
    const post_context = result_1.context;
    const post_is_like = (!!result_3);
    const post_like_count = result_1.postLike.length;
    const post_comment_count = result_1.postComment.length;
    const post_picture = result_2.picture;
    const post_name = result_2.name;
    
    const result_4 = result_1.postComment.map(async (element) => {
        const user_info = await User.findOne({
            where: {id: element.commenter_id},
            attributes: ['id', 'name', 'picture']
        });
        const outcome = {
            id: element.id,
            created_at: element.createdAt,
            content: element.content,
            user: {
                id: user_info.id,
                name: user_info.name,
                picture: user_info.picture
            }
        };
        return outcome;
    });

    const user_info = await User.findOne({
        where: {id: 242},
        attributes: ['id', 'name', 'picture']
    });
    console.log(result_1.postComment);

    const data = {
        post:{
            id: post_id,
            created_at: post_created_at,
            context: post_context,
            is_liked: post_is_like,
            like_count: post_like_count,
            comment_count: post_comment_count,
            picture: post_picture,
            name: post_name,
            comments: result_4
        }
    };  
    
    return res.status(200).json({data});
});


module.exports = router;