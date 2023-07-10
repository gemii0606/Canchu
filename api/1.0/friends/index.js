const express = require('express');
const router = express.Router();

const friendsRequestRoute = require('./friends_request');
// const friendsAgreeRoute = require('./friends_agree');

router.all('/:user_id/request', (req, res, next) => {
    console.log('index');
    next();
}, 
(req, res, next) => {
    console.log('index2');
    next();
}, 
friendsRequestRoute);
// router.get('/:friendship_id/agree', friendsAgreeRoute);

module.exports = router;