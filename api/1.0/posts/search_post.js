const express = require('express');
const router = express.Router();
const {User, Friendship, Post, Like, Comment} = require('../utils/models/model');
const { Op } = require('sequelize');
const moment = require('moment');
const Redis = require('ioredis');
const redisClient = new Redis();

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
        
        if (!user_id) {
            user_id = id
        }
        const pageSize = 10;

        const userPostIdKey = `user:${user_id}:post:cursor:${last_id}`;
        const userPostId = JSON.parse(await redisClient.get(userPostIdKey));

        let posts;
        let next_cursor = null;
        let success = false;
        console.log(user_id)
        console.log(id)
        console.log(user_id === id)
        if (user_id !== id && userPostId) {
            console.log('cache')
            posts = [];
            for (const postId of userPostId) {
                const postKey = `post:${postId}`;
                const likePostKey = `user:${id}:post:${postId}:like`;
                const postInfo  = JSON.parse(await redisClient.get(postKey));
                const likePost = JSON.parse(await redisClient.get(likePostKey));
                if ((!postInfo) || (!likePost)) {
                    break;
                }
                const obj = {
                    ...postInfo,
                    is_liked: likePost.is_liked
                };
                posts.push(obj);
            }
            success = true;
        } 

        if (!success) {
            console.log('db')
            let whereClause =  {
                user_id: user_id, 
                id: {[Op.lt]: last_id}
            }

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
                
                whereClause = {
                    [Op.or]: [{user_id: id}, ...friends_id],
                    id: {[Op.lt]: last_id}
                }
            }

            const results = await Post.findAll({
                where: whereClause,
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
            

            // next cursor only has info when there exists next page, or it will be null
            if (results.length > pageSize) {
                results.pop();
                let cursor_info = results[results.length - 1].id;
                next_cursor = btoa(cursor_info.toString());
            }
            
            posts = results.map(item =>{
                const outcome = {
                    id: item.id,
                    user_id: item.user_id,
                    created_at: moment.utc(item.createdAt).utcOffset(8).format("YYYY-MM-DD HH:mm:ss"),
                    context: item.context,
                    is_liked: item.postLike.some(like => like.liker_id === id),
                    like_count: item.postLike.length,
                    comment_count: item.postComment.length,
                    picture: item.postUser.picture,
                    name: item.postUser.name
                }
                return outcome;
            });


            const objective_post = posts.map( post => {
                const obj = {
                id: post.id,
                user_id: post.user_id,
                created_at: post.created_at,
                context: post.context,
                like_count: post.like_count,
                comment_count: post.comment_count,
                picture: post.picture,
                name: post.name
                }
                return obj;
            });

            const user_like_post = posts.map(post => {
                const obj = {
                    post_id: post.id,
                    is_liked: post.is_liked
                }
                return obj;
            });

            const user_post_id = posts.map(post => post.id);

            await redisClient.setex(userPostIdKey, 3600, JSON.stringify(user_post_id));

            for (const post of objective_post) {
                const postKey = `post:${post.id}`;
                await redisClient.setex(postKey, 3600, JSON.stringify(post));
            }

            for (const like of user_like_post) {
                const likePostKey = `user:${id}:post:${like.post_id}:like`;
                await redisClient.setex(likePostKey, 3600, JSON.stringify(like));
            }
        }

        const data = {
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