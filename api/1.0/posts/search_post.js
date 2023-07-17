const express = require('express');
const router = express.Router();
const {User, Post, Like, Comment} = require('../utils/models/model');
const { Op } = require('sequelize');
const moment = require('moment');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const id = decodedToken.id;  // see if you are receiver

    const { user_id, cursor } = req.query;

    let currentPage;
    if (cursor) {
        currentPage = parseInt(atob(cursor));
    } else {
        currentPage = 1;
    }
    
    const pageSize = 10;

    const options = {};

    if (user_id) {
        options.user_id = user_id;
    } else {
        options.user_id = id;
    }

    console.log(options)
    if (cursor) {
        options.id = { [Op.gt]: currentPage };
    
    }
    
    console.log(options)
    // 查詢數據庫
    const result = await Post.findAll({
        where: options,
        attributes: ['id', 'user_id', 'createdAt', 'context'],
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
        include:[
            {
                model: Like,
                as: 'postLike',
                attributes: ['liker_id']
            },
            {
                model: Comment,
                as: 'postComment',
                attributes: ['id']
            },
            {
                model: User,
                as: 'postUser',
                attributes: ['id','picture','name']
            }
        ]
      });

    console.log(result)
    
    const posts = result.map(item =>{
        const outcome = {
            id: item.id,
            user_id: item.user_id,
            created_at: moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            context: item.context,
            is_liked: item.postLike.some(like => like.liker_id === item.user_id),
            like_count: item.postLike.length,
            comment_count: item.postComment.length,
            picture: item.postUser.picture,
            name: item.postUser.name
        }
        return outcome;
    });

    // const data ={
    //     posts: 'a',
    //     next_cursor: btoa((currentPage + 1).toString())
    // };

    return res.status(200).json({ posts });

});


module.exports = router;