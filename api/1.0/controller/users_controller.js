const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {User, Friendship} = require('../utils/models/model');
const { Op } = require('sequelize');
const multer = require('multer');
const Redis = require('ioredis');
const redisClient = new Redis();


function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

const ErrorHandling = async (fn, res) => {
  try {
    await fn;
  } catch (err) {
    // Error handling, return server error response
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
}

const signUpUser = async (req, res) => {
  const {name, email, password} = req.body;    
        if (!(name && email && password)) { 
          return res.status(400).json({error: 'You should not leave empty!'});
        }
    
        if (!isValidEmail(email)) {
          return res.status(400).json({error: 'Please fill the correct email adress!'});
        }
        
        // check if the user had already had an account
        const select = await User.findOne({
          where: {
              email
          }
        });

        if (!!select) {
          return res.status(403).json({error: 'email adress has already exist!'});
        }

        // encrypt the user password
        const securePassword = crypto
            .createHash('sha256')
            .update(password + email)
            .digest('base64');
 
        // Create a new user
        const user = await User.create({
          name,
          email,
          password: securePassword,
          provider: "native",
          picture: null
        });

        // Create the JWT Token Payload
        let payload = {
          id: user.id,
          provider: user.provider,
          name: user.name,
          email: user.email,
          picture: user.picture
        };
    
        // Sign the Access Token using JWT
        const jwtSecret = 'Secret';
        let accessToken = jwt.sign(payload, jwtSecret);
    
        // Return the successful signup response
        res.status(200).json({
          data: {
            access_token: accessToken,
            user: payload,
          },
        });
      }

// Function for handling user sign-in with native method
async function signInNative(object, res) {
    const { provider, email, password } = object;
  
    if (!(email && password)) {
      return res.status(400).json({ error: 'Please fill in the empty content!' });
    }
  
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please fill in the correct email!' });
    }
  
    const securePassword = crypto
      .createHash('sha256')
      .update(password + email)
      .digest('base64');
  
    const user = await User.findOne({
      where: {
        email,
        password: securePassword
      },
      attributes: ['id', 'provider', 'name', 'email', 'picture']
    });
  
    // Check whether the email exists
    if (!user) {
      return res.status(403).json({ error: 'Please make sure your email or password are correct!' });
    }
  
    let payload = {
      id: user.id,
      provider: user.provider,
      name: user.name,
      email: user.email,
      picture: user.picture
    };
  
    const jwtSecret = 'Secret';
    let accessToken = jwt.sign(payload, jwtSecret);
  
    return res.status(200).json({
      data: {
        access_token: accessToken,
        user: payload
      }
    });
  }
  
// Function for handling user sign-in with Facebook method
async function signInFB(object, res) {
    try {
      const { provider, access_token } = object;
      const accessToken = access_token;
  
      const url = `https://graph.facebook.com/v17.0/me?fields=id,name,email&access_token=${accessToken}`;
  
      const userInfoResponse = await fetch(url);
      const userInfo = await userInfoResponse.json();
  
      const { name, email } = userInfo;
      const password = email;
  
      const user = await User.findOne({
        where: {
          email
        },
        attributes: ['id', 'provider', 'name', 'email', 'picture']
      });
  
      // Create user data if they didn't sign up in native before
      if (!user) {
        const cr_user = await User.create({
          name,
          email,
          password: password,
          provider: "facebook",
          picture: null
        });
      }
  
      // If the user signed up with the native method before, deny their access with Facebook
      if (user.provider === 'native') {
        return res.status(403).json({ error: 'Please use your native account!' });
      }
  
      let payload = {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture
      };
  
      return res.status(200).json({
        data: {
          access_token: accessToken,
          user: payload
        }
      });
    } catch (err) {
      console.error(`${err.message} `);
      res.status(500).json({ error: 'Server error' });
    }
  }

const signInUser = async (req, res) => {
    const body = req.body;
  
    if (!body.provider) {
      return res.status(400).json({ error: 'Empty provider!' });
    }
  
    if (body.provider !== 'native' && body.provider !== 'facebook') {
      return res.status(403).json({ error: 'Wrong provider!' });
    }
  
    if (body.provider === 'native') {
      signInNative(body, res);
    }
  
    if (body.provider === 'facebook') {
      signInFB(body, res);
    }
  }

const getUserProfile = async (req, res) => {
    // Get the user ID from the request URL
    const reqId = req.params.id;
    const userId = parseInt(reqId);
    const decodedToken = req.decodedToken;
    const id = decodedToken.id; // Get the ID of the logged-in user
  
    // Search for the user's profile data in Redis
    const userProfileKey = `user:${userId}:profile`;
    const userProfile = await redisClient.get(userProfileKey);
  
    // Search for the friendship data in Redis
    const userFriendshipKey = `user:${userId}:friendship:${id}`;
    const userFriendship = await redisClient.get(userFriendshipKey);
  
    let userInfo;
    let friend_count;
    if (userProfile) {
      // If user profile exists in Redis, use it directly
      userInfo = JSON.parse(userProfile);
    } else {
      // If not found in Redis, fetch user's info from the database and check if you are friends
      userInfo = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'name', 'picture', 'introduction', 'tags'],
        include: [
          {
            model: Friendship,
            as: 'fromFriendship',
            where: { to_id: id },
            attributes: ['id', 'status'],
            required: false
          },
          {
            model: Friendship,
            as: 'toFriendship',
            where: { from_id: id },
            attributes: ['id', 'status'],
            required: false
          }
        ],
        required: false
      });
  
      // Count the user's friends
      const { rows, count } = await Friendship.findAndCountAll({
        where: {
          [Op.or]: [{ from_id: userId }, { to_id: userId }],
          status: 'friend'
        }
      });
  
      friend_count = count;
    }
  
    // Set the friendship info
    let friendship = null;
    if (userFriendship) {
      // If friendship info exists in Redis, use it directly
      friendship = JSON.parse(userFriendship);
    } else {
      // If not found in Redis, fetch the friendship info from the database
      friend_result = await User.findOne({
        where: { id: userId },
        attributes: [],
        include: [
          {
            model: Friendship,
            as: 'fromFriendship',
            where: { to_id: id },
            attributes: ['id', 'status'],
            required: false
          },
          {
            model: Friendship,
            as: 'toFriendship',
            where: { from_id: id },
            attributes: ['id', 'status'],
            required: false
          }
        ],
        required: false
      });
  
      // Determine the relationship status with the user
      if (friend_result.toFriendship.length > 0) {
        friendship = friend_result.toFriendship[0].dataValues;
        if (friendship.status !== 'friend') {
          friendship.status = 'requested';
        }
      } else if (friend_result.fromFriendship.length > 0) {
        friendship = friend_result.fromFriendship[0].dataValues;
      }
    }
  
    // Prepare the user profile data
    const user_profile = {
      id: userInfo.id,
      name: userInfo.name,
      picture: userInfo.picture,
      friend_count: friend_count,
      introduction: userInfo.introduction,
      tags: userInfo.tags,
    }
  
    // Combine user profile data with friendship info
    const user = {
      ...user_profile,
      friendship: friendship
    };
  
    // Store the user profile and friendship info in Redis with a 1-hour expiration
    await redisClient.setex(userProfileKey, 3600, JSON.stringify(user_profile));
    await redisClient.setex(userFriendshipKey, 3600, JSON.stringify(friendship));
  
    return res.status(200).json({ data: { user } });
  }

const userProfile = async (req, res) => {
    const decodedToken = req.decodedToken;
    const id = decodedToken.id; // Get the ID of the logged-in user

    // Extract name, introduction, and tags from the request body
    const { name, introduction, tags } = req.body;
    console.log(req.body)

    // Check if at least one field is provided for update
    if (!(name || introduction || tags)) {
      return res.status(400).json({ error: 'You should make one change at least.' });
    }

    // Find the user's current profile information
    const userInfo = await User.findOne({
      where: {
        id: id
      },
      attributes: ['id', 'name', 'introduction', 'tags']
    });

    // Update the user's profile with the provided fields
    const update_user = await userInfo.update({
      name,
      introduction,
      tags
    });

    // Prepare the response data with the updated user ID
    const user = {
      id: update_user.id
    };

    // Delete the user's profile data from Redis to ensure it gets updated
    const deleteKey = `user:${id}:profile`;
    await redisClient.del(deleteKey);

    return res.status(200).json({ data: { user } });
}

module.exports ={
    ErrorHandling,
    signUpUser,
    signInUser,
    getUserProfile,
    userProfile
}