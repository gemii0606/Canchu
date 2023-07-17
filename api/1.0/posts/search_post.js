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

    const whereClause = {};

    if (user_id) {
      whereClause.user_id = user_id;
    } else {
      whereClause.user_id = id;
    }

    // 設置分頁的選項
    const options = {
      where: whereClause
    };
    console.log(options)
    if (cursor) {
        options.where.id = { [Op.gt]: currentPage };
    
    }
    
    console.log(options)
    // 查詢數據庫
    const { count, rows } = await Post.findAndCountAll({
        where: options,
        // offset: (currentPage - 1) * pageSize,
        // limit: pageSize,
      });

    const totalPages = Math.ceil(count / pageSize);
    const hasNextPage = currentPage < totalPages;

    const result = {
        posts: rows,
        totalPosts: count,
        currentPage,
        totalPages,
        hasNextPage,
      };
    
    const data ={
        posts: result.posts,
        next_cursor: btoa((currentPage + 1).toString())
    };
    // 返回結果
    return res.status(200).json({ data });

});


module.exports = router;