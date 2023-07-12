const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Event = require('../utils/model/events');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {
    try {
        //get the user id
        const reqEventId = req.baseUrl.split('/').slice(-2,-1)[0];
        const decodedToken = req.decodedToken;
        const user_id = decodedToken.id;
        const event_id = parseInt(reqEventId);

        const event = await Event.findOne({
            where: {id: event_id}
        });

        if (!event) {
            return res.status(400).json({ error: 'Request does not exist.' });
        }

        event.is_read = true;
        await event.save();
        
        const event_info = {
            event: {
                id: event.id
            }
        };
        return res.status(200).json({ data: event_info});

    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;