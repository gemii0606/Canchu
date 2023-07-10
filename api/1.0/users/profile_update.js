const express = require('express');
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');

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
