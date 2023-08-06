const { User, Friendship, Post, Like, Comment } = require('../utils/models/model');
const { Op } = require('sequelize');
const moment = require('moment');
const redisClient = require('../utils/redis')

const postCreate = async (req, res) => {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token
    const { context } = req.body; // Get the post content from the request body

    // Check if the post content is provided
    if (!context) {
      return res.status(400).json({ error: 'Please write something and post.' });
    }

    // Create a new post in the database
    const cr_post = await Post.create({
      user_id,
      context,
    });

    // Prepare the response data with the ID of the created post
    const post = {
      id: cr_post.id,
    };

    // Delete the corresponding cursor key from Redis to invalidate the cache
    const deleteKey = `user:${user_id}:post:cursor:18446744073709551615`;
    await redisClient.del(deleteKey);

    // Send the response with the post information
    return res.status(200).json({ data: { post } });
}

const postComment = async (req, res) => {
    const post_id = req.params.id; // Extract the post ID from the URL
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token
    const { content } = req.body; // Get the comment content from the request body

    // Create a new comment in the database
    const cr_comment = await Comment.create({
      post_id,
      commenter_id: user_id,
      content,
    });

    // Prepare the response data with the IDs of the post and the comment
    const post = {
      id: post_id,
    };
    const comment = {
      id: cr_comment.id,
    };

    // Delete the corresponding post key from Redis to invalidate the cache
    const deleteKey = `post:${post.id}`;
    await redisClient.del(deleteKey);

    // Send the response with the post and comment information
    return res.status(200).json({ data: { post, comment } });
}

const postLike = async (req, res) => {
    const post_id = req.params.id; // Extract the post ID from the URL
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token

    // Check if the post exists
    const find_post = await Post.findOne({
      where: {
        id: post_id,
      },
      attributes: ['id'],
    });

    if (!find_post) {
      return res.status(400).json({ error: 'Post does not exist.' });
    }

    // Check if the user has already liked the post
    const find_like = await Like.findOne({
      where: {
        post_id,
        liker_id: user_id,
      },
    });

    if (find_like) {
      return res.status(400).json({ error: 'You have already liked this post.' });
    }

    // Create a new like in the database
    const cr_like = await Like.create({
      post_id,
      liker_id: user_id,
    });

    // Prepare the response data with the ID of the post
    const post = {
      id: post_id,
    };

    // Delete the corresponding post and user like keys from Redis to invalidate the cache
    const deleteKey = `post:${post.id}`;
    const likePostKey = `user:${user_id}:post:${post_id}:like`;
    await redisClient.del(deleteKey);
    await redisClient.del(likePostKey);

    // Send the response with the post information
    return res.status(200).json({ data: { post } });
}

const postLikeDelete = async (req, res) => {
    const post_id = req.params.id; // Extract the post ID from the URL
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user ID from the decoded token

    // Check if the user has liked the post
    const find_like = await Like.findOne({
      where: {
        post_id: post_id,
        liker_id: user_id,
      },
      attributes: ['id'],
    });

    if (!find_like) {
      return res.status(400).json({ error: 'You have not liked this post.' });
    }

    // Delete the like entry from the database
    const delete_action = await Like.destroy({
      where: {
        id: find_like.id,
      },
    });

    // Prepare the response data with the ID of the post
    const post = {
      id: post_id,
    };

    // Delete the corresponding post and user like keys from Redis to invalidate the cache
    const deleteKey = `post:${post.id}`;
    const likePostKey = `user:${user_id}:post:${post_id}:like`;
    await redisClient.del(deleteKey);
    await redisClient.del(likePostKey);

    // Send the response with the post information
    return res.status(200).json({ data: { post } });
}

const postSearch = async (req, res) => {
    const decodedToken = req.decodedToken;
    const id = decodedToken.id; // Current user's ID

    let { user_id, cursor } = req.query;
    user_id = parseInt(user_id);

    // Acquire the cursor info to determine the starting point for pagination
    let last_id;
    if (cursor) {
      last_id = parseInt(atob(cursor));
    } else {
      last_id = 18446744073709551615n; // Set a default large value if cursor is not provided
    }

    // If user_id is not provided, use the current user's ID
    if (!user_id) {
      user_id = id;
    }

    const pageSize = 10; // Number of posts per page

    const userPostIdKey = `user:${user_id}:post:cursor:${last_id}`;
    const userPostId = JSON.parse(await redisClient.get(userPostIdKey));

    let posts;
    let next_cursor = null;
    let success = false;

    if (user_id !== id && userPostId) {
      // Use cached data if available for another user's posts
      console.log('cache');
      posts = [];
      for (const postId of userPostId) {
        const postKey = `post:${postId}`;
        const likePostKey = `user:${id}:post:${postId}:like`;
        const postInfo = JSON.parse(await redisClient.get(postKey));
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
      // Fetch data from the database if not available in the cache
      console.log('db');

      // Set the whereClause based on whether the user is the current user or a friend
      let whereClause = {
        user_id: user_id,
        id: { [Op.lt]: last_id }
      };

      if (user_id === id) {
        // If user_id is the current user, fetch posts of the user and their friends
        let [friends] = await User.findAll({
          where: { id: id },
          attributes: [],
          include: [
            {
              model: Friendship,
              as: 'fromFriendship',
              where: { status: 'friend' },
              attributes: ['to_id'],
              required: false
            },
            {
              model: Friendship,
              as: 'toFriendship',
              where: { status: 'friend' },
              attributes: ['from_id'],
              required: false
            }
          ],
          required: false
        });

        let friends_id = [];
        if (friends.fromFriendship.length > 0) {
          for (const friend of friends.fromFriendship) {
            friends_id.push({ user_id: friend.to_id });
          }
        }

        if (friends.toFriendship.length > 0) {
          for (const friend of friends.toFriendship) {
            friends_id.push({ user_id: friend.from_id });
          }
        }

        whereClause = {
          [Op.or]: [{ user_id: id }, ...friends_id],
          id: { [Op.lt]: last_id }
        };
      }

      // Fetch the posts with associated likes, comments, and user information
      const results = await Post.findAll({
        where: whereClause,
        attributes: ['id', 'user_id', 'createdAt', 'context'],
        order: [['id', 'DESC']],
        limit: pageSize + 1,
        include: [
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
            attributes: ['id', 'picture', 'name']
          }
        ]
      });

      // Determine if there is a next page and set the next_cursor accordingly
      if (results.length > pageSize) {
        results.pop();
        let cursor_info = results[results.length - 1].id;
        next_cursor = btoa(cursor_info.toString());
      }

      // Map the fetched results to the desired format
      posts = results.map(item => {
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

      // Create separate objects for caching
      const objective_post = posts.map(post => {
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

      // Cache the data in Redis with a time-to-live (TTL) of 1 hour (3600 seconds)
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

    // Prepare the response data with the posts and next cursor
    const data = {
      posts: posts,
      next_cursor: next_cursor
    };

    // Send the response with the data
    return res.status(200).json({ data });
}

const postUpdate = async (req, res) => {
    const post_id = req.params.id;
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
}

const postDetail = async (req, res) => {
    const search_post_id = req.params.id;
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
}

module.exports = {
    postCreate,
    postComment,
    postLike,
    postLikeDelete,
    postSearch,
    postUpdate,
    postDetail
}