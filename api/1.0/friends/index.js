const express = require('express');
const router = express.Router();
const { passReqparams } = require('../utils/function');
const friendRequestRoute = require('./friends_request');
// const friendAgreeRoute = require('./friends_agree');

router.post('/:user_id/request', (req, res, next) => {req.user_id = req.params.user_id; next();}, friendRequestRoute);

// router.post('/:friendship_id/agree', friendAgreeRoute);


module.exports = router;