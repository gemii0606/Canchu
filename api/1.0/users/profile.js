const express = require('express');
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');

// set the connection with mysql server
const pool = require('../utils/mysql');
  

router.get('/../:id/profile', checkAuthorization, async (req, res) => {
  // if the authorization passes, user can see others profile
    try {
      // taken id should be int
      console.log(req.params.id);
      const userId = parseInt(req.params.id);

      const [userItem] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      const userInfo = userItem[0];

      const {id, name, picture, introduction, tags} = userInfo;

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
