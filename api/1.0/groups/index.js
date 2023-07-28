const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization, upload } = require('../utils/function');
const { createGroup, groupDelete, groupJoin, groupPending, groupMemberAgree } = require('../controller/groups_controller');


router.delete('/:group_id', checkAuthorization, (req, res) => {ErrorHandling(groupDelete(req, res), res)});
router.post('/:group_id/join', checkAuthorization, (req, res) => {ErrorHandling(groupJoin(req, res), res)});
router.get('/:group_id/member/pending', checkAuthorization, (req, res) => {ErrorHandling(groupPending(req, res), res)});
router.post('/:group_id/member/:user_id/agree', checkAuthorization, upload.single('picture'), (req, res) => {ErrorHandling(groupMemberAgree(req, res), res)});
// router.post('/:group_id/post', checkAuthorization, (req, res) => {ErrorHandling(userSearch(req, res), res)});
router.post('/', checkAuthorization, (req, res) => {ErrorHandling(createGroup(req, res), res)});

module.exports = router;