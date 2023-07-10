const express = require('express');
const router = express.Router();

// take out the function
const { checkAuthorization } = require('../utils/function');

// set the connection with mysql server
const pool = require('../utils/mysql');


router.post('/', checkAuthorization, async (req, res) => {

    const decodedToken = req.decodedToken;
    console.log(decodedToken);
    console.log(req.params.user_id);
    const id = decodedToken.id;


});

module.exports = router;