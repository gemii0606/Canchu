const express = require('express');
const router = express.Router();

// Import custom middleware and controllers
const { ErrorHandling, checkAuthorization, upload } = require('../utils/function');
const { signUpUser, signInUser, getUserProfile, userProfile, userPictureUpdate, userSearch} = require('../controller/users_controller');

// Register a new user
router.post('/signup', (req, res) => {ErrorHandling(signUpUser(req, res), res)});

// User sign-in
router.post('/signin', (req, res) => {ErrorHandling(signInUser(req, res), res)});

// Get user profile
router.get('/:id/profile', checkAuthorization, (req, res) => {ErrorHandling(getUserProfile(req, res), res)});

// Update user profile
router.put('/profile', checkAuthorization, (req, res) => {ErrorHandling(userProfile(req, res), res)});

// Update user picture
router.put('/picture', checkAuthorization, upload.single('picture'), (req, res) => {ErrorHandling(userPictureUpdate(req, res), res)});

// Search for users
router.get('/search', checkAuthorization, (req, res) => {ErrorHandling(userSearch(req, res), res)});


module.exports = router;
