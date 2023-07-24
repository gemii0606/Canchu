const express = require('express');
const router = express.Router();
const { User, Post, Like, Comment } = require('../utils/models/model');
const moment = require('moment');
const Redis = require('ioredis');
const redisClient = new Redis();

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to update a post
router.put('/', checkAuthorization, async (req, res) => {
  const post_id = req.baseUrl.split('/').slice(-1);
  const decodedToken = req.decodedToken;
  const user_id = decodedToken.id; // Current user's ID
  const { context } = req.body;

  if (!context) {
    return res.status(400).json({ error: 'Please write something and post.' });
  }

  // Find the post to be updated
  const find_post = await Post.findOne({
    where: {
      id: post_id
    },
    attributes: ['id', 'user_id', 'context']
  });

  // Check if the current user is the owner of the post
  if (user_id !== find_post.user_id) {
    return res.status(400).json({ error: 'You are not the post owner!' });
  }

  // Update the post's context and save the changes
  find_post.context = context;
  await find_post.save();

  const post = {
    id: find_post.id
  };

  const deleteKey = `post:${post.id}`;
  await redisClient.del(deleteKey);

  return res.status(200).json({ data: { post } });
});

// Route to get a single post and its associated likes and comments
router.get('/', checkAuthorization, async (req, res) => {
  const search_post_id = req.baseUrl.split('/').slice(-1);
  const decodedToken = req.decodedToken;
  const id = decodedToken.id; // Current user's ID

  // Find the post and get its associated likes and comments
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

  // Get the post author's id and picture
  const result_2 = await User.findOne({
    where: { id: result_1.user_id },
    attributes: ['name', 'picture'],
  });

  // Check if the current user has liked the post
  const [result_3] = await Like.findAll({
    where: { liker_id: id, post_id: search_post_id }
  });

  // Extract necessary data from the results
  const post_id = result_1.id;
  const post_user_id = result_1.user_id;
  const post_created_at = moment.utc(result_1.createdAt).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
  const post_context = result_1.context;
  const post_is_like = (!!result_3); // Convert to boolean
  const post_like_count = result_1.postLike.length;
  const post_comment_count = result_1.postComment.length;
  const post_picture = result_2.picture;
  const post_name = result_2.name;

  // Get the commenter's info for each comment associated with the post
  const result_4 = result_1.postComment.map(async (element) => {
    const user_info = await User.findOne({
      where: { id: element.commenter_id },
      attributes: ['id', 'name', 'picture']
    });
    const outcome = {
      id: element.id,
      created_at: moment.utc(element.createdAt).utcOffset(8).format("YYYY-MM-DD HH:mm:ss"),
      content: element.content,
      user: {
        id: user_info.id,
        name: user_info.name,
        picture: user_info.picture
      }
    };
    return outcome;
  });

  // Wait for all the Promises to resolve
  const resolvedResults = await Promise.all(result_4);

  // Data reformation with the required information
  const data = {
    post: {
      id: post_id,
      user_id: post_user_id,
      created_at: post_created_at,
      context: post_context,
      is_liked: post_is_like,
      like_count: post_like_count,
      comment_count: post_comment_count,
      picture: post_picture,
      name: post_name,
      comments: resolvedResults // List of comments with their associated user information
    }
  };

  return res.status(200).json({ data });
});

module.exports = router;
