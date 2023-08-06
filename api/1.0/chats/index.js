const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization, upload } = require('../utils/function');
const { createChat, getChat } = require('../controller/chats_controller');


router.post('/:user_id', checkAuthorization, (req, res) => {ErrorHandling(createChat(req, res), res)});
router.get('/:user_id/messages', checkAuthorization, (req, res) => {ErrorHandling(getChat(req, res), res)});


module.exports = router;