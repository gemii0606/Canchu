const express = require('express');
const router = express.Router();
const User = require('../utils/models/users');
const Event = require('../utils/models/events');
const moment = require('moment');

// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {
    try {
        const decodedToken = req.decodedToken;
        const user_id = decodedToken.id;


        const events_request = await Event.findAll({
            where: { to_id: user_id },
            include: [
                {
                    model: User,
                    attributes: ['picture'],
                    as: 'eventFromUser'
                }
            ]
        });

        console.log(events_request)
        const events = events_request.map(event =>{
            const data ={
                id: event.id,
                type: event.type,
                is_read: event.is_read,
                image: event.eventFromUser.picture,
                created_at: moment(event.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                summary: event.summary
                };
            return data;
        });
        return res.status(200).json({data: {events}});
    
    } catch (err) {
        console.error(`${err.message} `);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;