const express = require('express');
const router = express.Router();
const {User, Friendship, Post, Like, Comment} = require('../utils/models/model');
const { Op } = require('sequelize');
const moment = require('moment');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {
    try{
        const decodedToken = req.decodedToken;
        const id = decodedToken.id;  // see if you are receiver

        let { user_id, cursor } = req.query;

        // acquire the cursor info
        let last_id;
        if (cursor) {
            last_id = parseInt(atob(cursor));
        } else {
            last_id = 18446744073709551615n;
        }
        
        const pageSize = 10;

        // if there's no user_id provided, your own id is default 
        if (!user_id) {
            user_id = id;
        }
        
        // if user search himself, show him his and his friends' posts
        // if user search other's post, show only other's post
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
                    attributes: ['to_id'],
                    required: false
                },
                {
                    model: Friendship,
                    as: 'toFriendship',
                    where:{status: 'friend'},
                    attributes: ['from_id'],
                    required: false
                }
                ],
                required: false
            });

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
        } else {
            results = await Post.findAll({
                where: {
                    user_id: user_id, 
                    id: {[Op.lt]: last_id}
                },
                attributes: ['id', 'user_id', 'createdAt', 'context'],
                order: [['id', 'DESC']],
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

        // next cursor only has info when there exists next page, or it will be null
        let next_cursor = null;
        if (results.length > pageSize) {
            results.pop();
            let cursor_info = results[results.length - 1].id;
            next_cursor = btoa(cursor_info.toString());
        }
        
        const posts = results.map(item =>{
            const outcome = {
                id: item.id,
                user_id: item.user_id,
                created_at: moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                context: item.context,
                is_liked: item.postLike.some(like => like.liker_id === id),
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
    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }

});


module.exports = router;