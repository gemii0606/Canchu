const express = require('express');
const router = express.Router();
const {ErrorHandling, signUpUser} = require('../controller/users_controller')

router.post('/', (req, res) => {ErrorHandling(signUpUser(req, res), res)});

module.exports = router;