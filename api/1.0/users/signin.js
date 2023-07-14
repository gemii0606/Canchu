const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();

// set the connection with mysql server
const pool = require('../utils/mysql');

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// for native sign-in method
async function signInNative(object, res) {
    const {provider, email, password} = object;
  
    if (!(email && password)) {
      return res.status(400).json({error: 'Please fill the empty content!'});
    }
  
    if (!isValidEmail(email)) {
      return res.status(400).json({error: 'Please fill the correct email!'});
    }

    const securePassword = crypto
        .createHash('sha256')
        .update(password + email)
        .digest('base64');

    const [userItem] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, securePassword]);
    
    // check whether the email exists
    if (userItem.length === 0) {
      return res.status(403).json({error: 'Please make sure your email or password are corrrect!'});
    } 
    
    // it's an array with one element of an object
    const user = userItem[0];
    
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

// for FB sign-in method
async function signInFB(object, res) {
    try {
    const {provider, access_token} = object;
    const accessToken = access_token;

    const url = `https://graph.facebook.com/v17.0/me?fields=id,name,email&access_token=${accessToken}`;

    const userInfoResponse = await fetch(url);
    const userInfo = await userInfoResponse.json();

    const { name, email } = userInfo;
    const password = email;
    
    const [select] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    // establish the user data if they didn't sign up in native before
    if (select.length === 0) {
        const [item] = await pool.query('INSERT INTO users (name, email, password, provider, picture) VALUES (?, ?, ?, ?, ?)', [name, email, password, "facebook", null]);
    }
    // if the user have sign up with the native before, deny their access with FB
    if (select.provider === 'native'){
      return res.status(403).json({error: 'Please use your native account!'});
    }
    // take the user data from database(we need the database id)
    const [userItem] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = userItem[0];

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


router.post('/', async (req, res) => {
    // for Sign-in function  
      try{
        const body = req.body;
        if (!body.provider) {                        
          return res.status(400).json({error: 'empty provider!'});
        }
    
        if (body.provider !== 'native' && body.provider !== 'facebook') {            
          return res.status(403).json({error: 'Wrong provider!'});
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

