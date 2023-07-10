const express = require('express');
const router = express.Router();
const signupRoute = require('./signup');
const signinRoute = require('./signin');
const profileRoute = require('./profile');
const profileUpdateRoute = require('./profile_update');
const picetureUpdateRoute = require('./picture_update');
const friendRequestRoute = require('./friends_request');
// const friendAgreeRoute = require('./friends_agree');

router.use('/signup', signupRoute);
router.use('/signin', signinRoute);
router.get('/:id/profile', profileRoute);
router.use('/profile', profileUpdateRoute);
router.use('/picture', picetureUpdateRoute);
router.use('/friends/:user_id/request', friendRequestRoute);
// router.post('/friends/:friendship_id/agree', friendAgreeRoute);


module.exports = router;
