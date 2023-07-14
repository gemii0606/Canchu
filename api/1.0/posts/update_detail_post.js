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
    const post_id = req.baseUrl.split('/').slice(-1);
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;  // see if you are receiver
 
    const post = await Post.findOne({
        where: { id: 1 },
        include: [
          {
            model: User,
            as: 'postUser',
            attributes: ['id', 'name', 'picture']
          },
          {
            model: Comment,
            as: 'postComment',
            attributes: ['id', 'created_at', 'content'],
            include: {
              model: User,
              as: 'commentUser',
              attributes: ['id', 'name', 'picture']
            }
          }
        ]
      });
      
      // 格式化回應資料
      const formattedPost = {
        id: post.id,
        created_at: post.created_at,
        context: post.context,
        is_liked: true, // TODO: 根據實際邏輯填入
        like_count: post.postLike.length, // 假設已建立 Like 的關聯
        comment_count: post.postComment.length, // 假設已建立 Comment 的關聯
        picture: post.picture,
        name: post.postUser.name,
        comments: post.postComment.map(comment => ({
          id: comment.id,
          created_at: comment.created_at,
          content: comment.content,
          user: {
            id: comment.commentUser.id,
            name: comment.commentUser.name,
            picture: comment.commentUser.picture
          }
        }))
      };
      
      return res.status(200).json({ post: formattedPost });
});


module.exports = router;