const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Event = require('../utils/model/events');


// take out the function
const { checkAuthorization } = require('../utils/function');


router.post('/', checkAuthorization, async (req, res) => {

    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;


    const events_request = await Event.findAll({
        where: { to_id: user_id },
        include: [
            {
                model: User,
                attributes: ['picture'],
                as: 'FromUser'
            }
        ]
    });

    console.log(events_request);
    console.log(events_request.length);
    if (events_request.length !== 0) {
        const events = events_request.map(event =>{
            const data ={
                id: events_request.id,
                type: events_request.type,
                is_read: events_request.is_read,
                image: event.dataValues.FromUser.picture,
                created_at: events_request.createdAt,
                summary: events_request.summary
                };
            return data;
        });
        return res.status(200).json({data: {events}});
    }
});


module.exports = router;