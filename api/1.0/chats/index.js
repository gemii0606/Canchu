const express = require('express');
const router = express.Router();

const { ErrorHandling, checkAuthorization, upload } = require('../utils/function');
const { createChat } = require('../controller/chats_controller');


router.delete('/:user_id', checkAuthorization, (req, res) => {ErrorHandling(createChat(req, res), res)});


module.exports = router;