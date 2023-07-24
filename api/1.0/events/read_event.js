const express = require('express');
const router = express.Router();
const User = require('../utils/models/users');
const Event = require('../utils/models/events');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route to mark an event as read
router.post('/', checkAuthorization, async (req, res) => {
  try {
    // Get the event ID from the request URL
    const reqEventId = req.baseUrl.split('/').slice(-2, -1)[0];
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const event_id = parseInt(reqEventId);

    // Find the event with the given ID
    const event = await Event.findOne({
      where: { id: event_id },
    });

    // Check if the event exists
    if (!event) {
      return res.status(400).json({ error: 'Request does not exist.' });
    }

    // Mark the event as read by setting is_read to true
    event.is_read = true;
    await event.save();

    // Prepare the response data with the event ID
    const event_info = {
      event: {
        id: event.id,
      },
    };

    // Send the response with the event information
    return res.status(200).json({ data: event_info });
  } catch (err) {
    console.error(`${err.message} `);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
