const express = require('express');
const router = express.Router();

const friendsRequestRoute = require('./friends_request');
// const friendsAgreeRoute = require('./friends_agree');

router.use('/:user_id/request', (req, res, next) => {
    console.log('index');
    next();
}, friendsRequestRoute);
// router.get('/:friendship_id/agree', friendsAgreeRoute);

module.exports = router;