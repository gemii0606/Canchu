const jwt = require('jsonwebtoken');
const multer = require('multer');


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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public'); // Store the uploaded file in the 'public' directory
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded image based on the original name and current timestamp
    cb(null, file.originalname.split('.')[0] + '_' + Date.now() + '.jpg');
    console.log(file.originalname.split('.')[0]);
  }
});

// Create the multer middleware for handling file uploads
const upload = multer({ storage: storage});

module.exports = {
    checkAuthorization,
    upload
};