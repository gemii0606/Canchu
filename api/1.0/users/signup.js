const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {User} = require('../utils/models/model');
const router = express.Router();

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

router.post('/', async (req, res) => {
    // for Sign-up finction
      const {name, email, password} = req.body;
    
      try {
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
        
        const user = await User.create({
          name,
          email,
          password: securePassword,
          provider: "native",
          picture: null
        });

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
