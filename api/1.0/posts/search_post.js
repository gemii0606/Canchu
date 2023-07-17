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
                attributes: ['id', 'liker_id']
            },
            {
                model: Comment,
                as: 'postComment',
                attributes: ['id', 'commenter_id']
            },
            {
                model: User,
                as: 'postUser',
                attributes: ['id']
            }
        ]
      });

    // const totalPages = Math.ceil(count / pageSize);
    // const hasNextPage = currentPage < totalPages;

    console.log(result)
    
    // const data ={
    //     posts: 'rows',
    //     next_cursor: btoa((currentPage + 1).toString())
    // };
    // 返回結果
    return res.status(200).json({ result });

});


module.exports = router;