const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../utils/models/model');
const router = express.Router();
const {ErrorHandling, signInUser} = require('../controller/users_controller')




// Route for handling user sign-in
router.post('/', (req, res) => {ErrorHandling(signInUser(req, res), res)});

module.exports = router;
