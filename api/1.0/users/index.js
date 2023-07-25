const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization, upload } = require('../utils/function');
const { signUpUser, signInUser, getUserProfile, userProfile, userPictureUpdate, userSearch} = require('../controller/users_controller')

router.post('/signup', (req, res) => {ErrorHandling(signUpUser(req, res), res)});
router.post('/signin', (req, res) => {ErrorHandling(signInUser(req, res), res)});
router.get('/:id/profile', checkAuthorization, (req, res) => {ErrorHandling(getUserProfile(req, res), res)});
router.put('/profile', checkAuthorization, (req, res) => {ErrorHandling(userProfile(req, res), res)});
router.put('/picture', checkAuthorization, upload.single('picture'), (req, res) => {ErrorHandling(userPictureUpdate(req, res), res)});
router.get('/search', checkAuthorization, (req, res) => {ErrorHandling(userSearch(req, res), res)});


module.exports = router;
