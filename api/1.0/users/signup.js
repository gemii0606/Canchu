const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {User} = require('../utils/models/model');
const router = express.Router();

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function signUpUser(res, name, email, password) {
  if (!(name && email && password)) {
    return res.status(400).json({error: 'You should not leave empty!'});
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({error: 'Please fill the correct email adress!'});
  }

  const select = await User.findOne({
    where: {
      email
    }
  });

  if (!!select) {
    return res.status(403).json({error: 'email adress has already exist!'});
  }

  const securePassword = crypto
    .createHash('sha256')
    .update(password + email)
    .digest('base64');

  const user = await User.create({
    name,
    email,
    password: securePassword,
    provider: "native",
    picture: null
  });

  const payload = {
    id: user.id,
    provider: user.provider,
    name: user.name,
    email: user.email,
    picture: user.picture
  };

  const jwtSecret = 'Secret';
  const accessToken = jwt.sign(payload, jwtSecret);

  return {
    access_token: accessToken,
    user: payload
  };
}

router.post('/', async (req, res) => {
    // for Sign-up finction
    try {
      const { name, email, password } = req.body;
      const result = await signUpUser(name, email, password);
      res.status(200).json({ data: result });
    } catch (err) {
      // Error handling, return server error response
      console.error(`${err.message} `);
      res.status(500).json({ error: 'Server error' });
    }
    });

module.exports = router;
