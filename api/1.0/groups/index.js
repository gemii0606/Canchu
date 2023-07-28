const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization, upload } = require('../utils/function');
const { createGroup, groupDelete, groupJoin  } = require('../controller/groups_controller');

router.post('/groups', checkAuthorization, (req, res) => {ErrorHandling(createGroup(req, res), res)});
router.delete('/groups/:group_id', checkAuthorization, (req, res) => {ErrorHandling(groupDelete(req, res), res)});
router.post('/groups/:group_id/join', checkAuthorization, (req, res) => {ErrorHandling(groupJoin(req, res), res)});
router.get('/groups/:group_id/member/pending', checkAuthorization, (req, res) => {ErrorHandling(userProfile(req, res), res)});
// router.put('/picture', checkAuthorization, upload.single('picture'), (req, res) => {ErrorHandling(userPictureUpdate(req, res), res)});
// router.get('/search', checkAuthorization, (req, res) => {ErrorHandling(userSearch(req, res), res)});


module.exports = router;