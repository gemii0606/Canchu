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

    let last_id;
    let currentPage;
    if (cursor) {
        let req_cursor_info = atob(cursor).split(":");
        last_id = parseInt(req_cursor_info[0]);
        currentPage = parseInt(req_cursor_info[1]);
    } else {
        last_id = 0;
        currentPage = 1;
    }
    
    const pageSize = 10;

    const options = {};

    if (user_id) {
        options.user_id = user_id;
    } else {
        options.user_id = id;
        user_id = id;
    }

    if (cursor) {
        options.id = { [Op.lt]: last_id };
    
    }
    
    console.log(user_id)
    console.log(id)
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
                attributes: ['to_id']
              },
              {
                model: Friendship,
                as: 'toFriendship',
                where:{status: 'friend'},
                attributes: ['from_id']
              }
            ]
        });

        console.log(friends)

        let friends_id = [];
        if (friends.fromFriendship.length > 0) {
            for (const friend of friends.fromFriendship) {
                friends_id.push({user_id: friend.to_id});
                }
        } 
            
        if (friends.toFriendship.length > 0) {
            for (const friend of friends.toFriendship) {
                friends_id.push({user_id: friend.from_id});
            }
        }
    
        results = await Post.findAll({
            where: {
                [Op.or]: [{user_id: id}, ...friends_id],
                id: {[Op.lt]: last_id}
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
        console.log(results)    
    } else {
        results = await Post.findAll({
            where: {
                user_id: user_id, 
                id: {[Op.lt]: last_id}
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

    let next_cursor = null;
    if (results.length > pageSize) {
        results.pop();
        let cursor_info = `${results[results.length - 1].id}:${results.length + currentPage}`;
        next_cursor = btoa(cursor_info.toString());
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