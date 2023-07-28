const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization, upload } = require('../utils/function');
const { createGroup, groupDelete, groupJoin, groupPending, groupMemberAgree, groupPost, groupGetPost } = require('../controller/chats_controller');


router.delete('/:user_id', checkAuthorization, (req, res) => {ErrorHandling(groupDelete(req, res), res)});


module.exports = router;