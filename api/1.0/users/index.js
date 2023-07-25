const express = require('express');
const router = express.Router();
// const signupRoute = require('./signup');
const signinRoute = require('./signin');
const profileRoute = require('./profile');
const profileUpdateRoute = require('./profile_update');
const picetureUpdateRoute = require('./picture_update');
const searchRoute = require('./search');


// router.use('/signup', signupRoute);
router.use('/signin', signinRoute);
router.use('/:id/profile', profileRoute);
router.use('/profile', profileUpdateRoute);
router.use('/picture', picetureUpdateRoute);
router.use('/search', searchRoute);

const {ErrorHandling, signUpUser} = require('../controller/users_controller')

router.post('/signup', (req, res) => {ErrorHandling(signUpUser(req, res), res)});

module.exports = router;
