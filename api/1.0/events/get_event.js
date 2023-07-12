const express = require('express');
const router = express.Router();
const User = require('../utils/model/users');
const Event = require('../utils/model/events');


// take out the function
const { checkAuthorization } = require('../utils/function');


router.get('/', checkAuthorization, async (req, res) => {

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
                id: event.dataValues.id,
                type: event.dataValues.type,
                is_read: event.dataValues.is_read,
                image: event.dataValues.FromUser.dataValues.picture,
                created_at: event.dataValues.createdAt,
                summary: event.dataValues.summary
                };
            return data;
        });
        return res.status(200).json({data: {events}});
    }
});


module.exports = router;