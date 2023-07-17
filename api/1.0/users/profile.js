const express = require('express');
const {User} = require('../utils/models/model');
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');
  
router.get('/', checkAuthorization, async (req, res) => {
  // if the authorization passes, user can see others profile
    try {
      // taken id from its baseUrl property, if /:id/profile, then :id should be in the -2 position
      const reqId = req.baseUrl.split('/').slice(-2,-1)[0];
      const userId = parseInt(reqId);

      const userInfo = await User.findOne({
        where: {
            id: userId
        },
        attributes: ['id', 'name', 'picture', 'introduction', 'tags']
      });

      const user = {
          id: userInfo.id,
          name: userInfo.name,
          picture: userInfo.picture,
          friend_count: 1,
          introduction: userId.introduction,
          tags: userInfo.tags,
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
