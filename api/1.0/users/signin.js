const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../utils/models/model');
const router = express.Router();

// Helper function to check if the email format is valid
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
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

// Route for handling user sign-in
router.post('/', async (req, res) => {
  try {
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
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }

});

module.exports = router;
