const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Event = require('../utils/model/events');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    //get the user id
    const reqEventId = req.baseUrl.split('/').slice(-2,-1)[0];
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const event_id = parseInt(reqEventId);

    const event = await Event.findOne({
        where: {id: event_id}
    });
    console.log(event);

});


module.exports = router;