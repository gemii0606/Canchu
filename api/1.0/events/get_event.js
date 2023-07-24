const express = require('express');
const router = express.Router();
const User = require('../utils/models/users');
const Event = require('../utils/models/events');
const moment = require('moment');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to get events for a user
router.get('/', checkAuthorization, async (req, res) => {
  try {
    // Get the user ID from the decoded token
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;

    // Fetch events associated with the user (where user is the receiver)
    const events_request = await Event.findAll({
      where: { to_id: user_id },
      order: [['id', 'DESC']], // Order the events in descending order of ID
      include: [
        {
          model: User,
          attributes: ['picture'], // Include the sender's picture in the response
          as: 'eventFromUser', // Use the alias 'eventFromUser' to get the sender's information
        },
      ],
    });

    // Map the events data to required format for the response
    const events = events_request.map((event) => {
      const data = {
        id: event.id, // Event ID
        type: event.type, // Event type
        is_read: event.is_read, // Is the event read by the receiver
        image: event.eventFromUser.picture, // Sender's picture
        created_at: moment.utc(event.createdAt).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'), // Event creation time in user's timezone (UTC+8)
        summary: event.summary, // Event summary
      };
      return data;
    });

    // Send the events data in the response
    return res.status(200).json({ data: { events } });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
