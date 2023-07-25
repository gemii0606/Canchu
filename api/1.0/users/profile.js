const express = require('express');
const { User, Friendship } = require('../utils/models/model');
const { Op } = require('sequelize');
const Redis = require('ioredis');
const redisClient = new Redis();
const router = express.Router();

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');


// const ErrorHandling = async (fn, res) => {
//   try {
//     await fn;
//   } catch (err) {
//     // Error handling, return server error response
//     console.error(`${err.message} `);
//     res.status(500).json({ error: 'Server error' });
//   }
// }

// const getUserProfile = async (req, res) => {
//   // Get the user ID from the request URL
//   const reqId = req.baseUrl.split('/').slice(-2, -1)[0];
//   const userId = parseInt(reqId);
//   const decodedToken = req.decodedToken;
//   const id = decodedToken.id; // Get the ID of the logged-in user

//   // Search for the user's profile data in Redis
//   const userProfileKey = `user:${userId}:profile`;
//   const userProfile = await redisClient.get(userProfileKey);

//   // Search for the friendship data in Redis
//   const userFriendshipKey = `user:${userId}:friendship:${id}`;
//   const userFriendship = await redisClient.get(userFriendshipKey);

//   let userInfo;
//   let friend_count;
//   if (userProfile) {
//     // If user profile exists in Redis, use it directly
//     userInfo = JSON.parse(userProfile);
//   } else {
//     // If not found in Redis, fetch user's info from the database and check if you are friends
//     userInfo = await User.findOne({
//       where: { id: userId },
//       attributes: ['id', 'name', 'picture', 'introduction', 'tags'],
//       include: [
//         {
//           model: Friendship,
//           as: 'fromFriendship',
//           where: { to_id: id },
//           attributes: ['id', 'status'],
//           required: false
//         },
//         {
//           model: Friendship,
//           as: 'toFriendship',
//           where: { from_id: id },
//           attributes: ['id', 'status'],
//           required: false
//         }
//       ],
//       required: false
//     });

//     // Count the user's friends
//     const { rows, count } = await Friendship.findAndCountAll({
//       where: {
//         [Op.or]: [{ from_id: userId }, { to_id: userId }],
//         status: 'friend'
//       }
//     });

//     friend_count = count;
//   }

//   // Set the friendship info
//   let friendship = null;
//   if (userFriendship) {
//     // If friendship info exists in Redis, use it directly
//     friendship = JSON.parse(userFriendship);
//   } else {
//     // If not found in Redis, fetch the friendship info from the database
//     friend_result = await User.findOne({
//       where: { id: userId },
//       attributes: [],
//       include: [
//         {
//           model: Friendship,
//           as: 'fromFriendship',
//           where: { to_id: id },
//           attributes: ['id', 'status'],
//           required: false
//         },
//         {
//           model: Friendship,
//           as: 'toFriendship',
//           where: { from_id: id },
//           attributes: ['id', 'status'],
//           required: false
//         }
//       ],
//       required: false
//     });

//     // Determine the relationship status with the user
//     if (friend_result.toFriendship.length > 0) {
//       friendship = friend_result.toFriendship[0].dataValues;
//       if (friendship.status !== 'friend') {
//         friendship.status = 'requested';
//       }
//     } else if (friend_result.fromFriendship.length > 0) {
//       friendship = friend_result.fromFriendship[0].dataValues;
//     }
//   }

//   // Prepare the user profile data
//   const user_profile = {
//     id: userInfo.id,
//     name: userInfo.name,
//     picture: userInfo.picture,
//     friend_count: friend_count,
//     introduction: userInfo.introduction,
//     tags: userInfo.tags,
//   }

//   // Combine user profile data with friendship info
//   const user = {
//     ...user_profile,
//     friendship: friendship
//   };

//   // Store the user profile and friendship info in Redis with a 1-hour expiration
//   await redisClient.setex(userProfileKey, 3600, JSON.stringify(user_profile));
//   await redisClient.setex(userFriendshipKey, 3600, JSON.stringify(friendship));

//   return res.status(200).json({ data: { user } });
// }


// Route for getting user profile and friendship information
router.get('/', checkAuthorization, (req, res) => {
  ErrorHandling(getUserProfile(req, res), res);
});

module.exports = router;
