const express = require('express');
const {User} = require('../utils/models/model');
const multer = require('multer');
const Redis = require('ioredis');
const redisClient = new Redis();
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');

// set the connection with mysql server
const pool = require('../utils/mysql');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.split('.')[0]  + '_' + Date.now() + '.jpg'); 
        console.log(file.originalname.split('.')[0]);
    }
});
  

const upload = multer({ storage: storage });

router.put('/', checkAuthorization, upload.single('picture'), async (req, res) => {
    const decodedToken = req.decodedToken;
    const id = decodedToken.id;

    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }
    const fileName = req.file.filename ;
    const picturePAth = 'https://13.210.26.62/' + fileName;

    const userInfo = await User.findOne({
        where: {
            id: id
        },
        attributes: ['id', 'picture']
      });
    
    userInfo.picture = picturePAth;
    await userInfo.save();

    const deleteKey = `user:${id}:profile`;
    redisClient.del(deleteKey);

    return res.status(200).json({ picture: picturePAth });
});

module.exports = router;
