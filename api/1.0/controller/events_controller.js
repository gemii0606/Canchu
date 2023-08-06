const {User, Friendship, Event} = require('../utils/models/model');
const moment = require('moment');

const eventGet = async (req, res) => {
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
}

const eventRead = async (req, res) => {
    // Get the event ID from the request URL
    const reqEventId = req.params.event_id;
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
}


module.exports ={
    eventGet,
    eventRead
}