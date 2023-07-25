const express = require('express');
const router = express.Router();

// const signinRoute = require('./signin');
// const profileRoute = require('./profile');
const profileUpdateRoute = require('./profile_update');
const picetureUpdateRoute = require('./picture_update');
const searchRoute = require('./search');



// router.use('/signin', signinRoute);
router.use('/:id/profile', profileRoute);
// router.use('/profile', profileUpdateRoute);
router.use('/picture', picetureUpdateRoute);
router.use('/search', searchRoute);

const { checkAuthorization } = require('../utils/function');
const {ErrorHandling, signUpUser, signInUser, getUserProfile} = require('../controller/users_controller')

router.post('/signup', (req, res) => {ErrorHandling(signUpUser(req, res), res)});
router.post('/signin', (req, res) => {ErrorHandling(signInUser(req, res), res)});
router.get('/profile', checkAuthorization, (req, res) => {ErrorHandling(getUserProfile(req, res), res)});


module.exports = router;
