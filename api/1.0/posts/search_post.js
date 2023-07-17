const express = require('express');
const router = express.Router();
const {User, Friendship, Post, Like, Comment} = require('../utils/models/model');
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
        currentPage = 0;
    }
    
    const pageSize = 10;

    const options = {};

    if (user_id) {
        options.user_id = user_id;
    } else {
        options.user_id = id;
    }

    if (cursor) {
        options.id = { [Op.gt]: currentPage };
    
    }
    
    let results;
    if (user_id === id) {
        let [friends] = await User.findAll({
            where: { id: id },
            attributes: [],
            include: [
              {
                model: Friendship,
                as: 'fromFriendship',
                where:{status: 'friend'},
                attributes: [],
                include: [
                  {
                    model: User,
                    as: 'toUser',
                    attributes: ['id', 'name', 'picture'],
                  }
                ]
              },
              {
                model: Friendship,
                as: 'toFriendship',
                where:{status: 'friend'},
                attributes: [],
                include: [
                  {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'name', 'picture']
                  }
                ]
              }
            ]
        });

        let friends_id = [];
        if (friends.fromFriendship.length > 0) {
            for (const friend of friends.fromFriendship) {
                friends_id.push({user_id: friend.toUser.id});
                }
        } 
            
        if (friends.toFriendship.length > 0) {
            for (const friend of friends.toFriendship) {
                friends_id.push({user_id: friend.toUser.id});
            }
        }
    
        results = await Post.findAll({
            where: {
                [Op.or]: [{user_id: id}, ...friends_id],
                id: {[Op.gt]: currentPage}
            },
            attributes: ['id', 'user_id', 'createdAt', 'context'],
            order: [['id', 'DESC']],
            offset: (currentPage - 1) * pageSize,
            limit: pageSize + 1,
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
    }
    // } else {
    //     results = await Post.findAll({
    //         where: options,
    //         attributes: ['id', 'user_id', 'createdAt', 'context'],
    //         order: [['id', 'DESC']],
    //         offset: (currentPage - 1) * pageSize,
    //         limit: pageSize + 1,
    //         include:[
    //             {
    //                 model: Like,
    //                 as: 'postLike',
    //                 attributes: ['liker_id']
    //             },
    //             {
    //                 model: Comment,
    //                 as: 'postComment',
    //                 attributes: ['id']
    //             },
    //             {
    //                 model: User,
    //                 as: 'postUser',
    //                 attributes: ['id','picture','name']
    //             }
    //         ]
    //     });
    // }
    console.log(results)
    let next_cursor = null;
    if (results.length > pageSize) {
        results.pop();
        next_cursor = btoa((results.length + currentPage).toString());
    }
    
    const posts = results.map(item =>{
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

    const data ={
        posts: posts,
        next_cursor: next_cursor
    };
    return res.status(200).json({ data });


});


module.exports = router;