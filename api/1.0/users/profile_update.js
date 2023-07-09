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


router.put('/', checkAuthorization, async (req, res) => {
    try {
      const decodedToken = req.decodedToken;
      const id = decodedToken.id;

      const { name, introduction, tags } = req.body;

      if (!(name || introduction || tags)) {
        return res.status(400).json({ error: 'You should make one change at least.' });
      }
      const [result] = await pool.query('UPDATE users SET name = ?, introduction = ?, tags = ? WHERE id = ?', [name, introduction, tags, id]);
      
      const user = {
        id
      };

      return res.status(200).json({ data: {user} });

    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }
  });


module.exports = router;
