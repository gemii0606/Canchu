const express = require('express');
const {User} = require('../utils/models/model');
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');

router.put('/', checkAuthorization, async (req, res) => {
    try {
      const decodedToken = req.decodedToken;
      const id = decodedToken.id;

      const { name, introduction, tags } = req.body;
      console.log(req.body)
      if (!(name || introduction || tags)) {
        return res.status(400).json({ error: 'You should make one change at least.' });
      }
      
      const userInfo = await User.findOne({
        where: {
            id: id
        },
        attributes: ['id', 'name', 'introduction', 'tags']
      });
      
      const update_user = await userInfo.update({
        name,
        introduction,
        tags
      })
      // await userInfo.save();
      console.log(update_user)

      const user = {
        id: update_user.id
      };

      return res.status(200).json({ data: {user} });

    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }
  });


module.exports = router;
