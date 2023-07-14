const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// set the connection with mysql server
const pool = require('../utils/mysql');

router.post('/', async (req, res) => {
    // for Sign-up finction
      const {name, email, password} = req.body;
    
      try {
        if (!(name && email && password)) { 
          res = res.status(400);
          res = res.json({error: 'You should not leave empty!'});
          return res;
        }
    
        if (!isValidEmail(email)) {
          res = res.status(400);
          res = res.json({error: 'Please fill the correct email adress!'});
          return res;
        }
        
        // check if the user had already had an account
        const [select] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (select.length !== 0) {
          res = res.status(403);
          res = res.json({error: 'email adress has already exist!'});
          return res;
        }
        
        // encrypt the user password
        const securePassword = crypto
            .createHash('sha256')
            .update(password + email)
            .digest('base64');

        // add the user data into database, and select the info from database(we need database id)
        const [item] = await pool.query('INSERT INTO users (name, email, password, provider, picture) VALUES (?, ?, ?, ?, ?)', [name, email, securePassword, "native", null]);
        const [userItem] = await pool.query('SELECT * FROM users WHERE id = ?', [item.insertId]);
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
    
        res.status(200).json({
          data: {
            access_token: accessToken,
            user: payload,
          },
        });
      } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
      }
    });

module.exports = router;
