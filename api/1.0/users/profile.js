const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const router = express.Router();

function checkAuthorization(req, res, next) {

  if (!req.headers.authorization) {
    return res.status(401).send({ error: 'No token provided' });
  }
  const token = req.headers.authorization.split(' ')[1];

  const jwtSecret = 'Secret';
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: "Wrong token" });
    }
    const decodedToken = decoded;
    req.decodedToken = decodedToken;
    return next();
  });
}

// set the connection with mysql server
const pool = require('../utils/mysql');
  

router.get('/:id/profile', checkAuthorization, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      // const { id, provider, name, email, picture, iat } = req.decodedToken;

      // if (id !== userId) {
      //     return res.status(403).json({ error: 'Forbidden' });
      // }

      const [userItem] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      const userInfo = userItem[0];
      const id = userInfo.id;
      const name = userInfo.name;
      const picture = userInfo.picture;
      const introduction = userInfo.introduction;
      const tags = userInfo.tags;

      const user = {
          id,
          name,
          picture,
          friend_count: 1,
          introduction,
          tags,
          friendship: {
            id: 1,
            status: "requested"
          }
      };

      return res.status(200).json({ data: {user} });

    } catch (err) {
        console.error(`${err.message} `);
        return res.status(500).json({ error: 'Server error' });
    }
 });

module.exports = router;
