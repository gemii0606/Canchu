const express = require('express');
const app = express();
var cors = require('cors')
const usersRoute = require('./users');
const friendsRoute = require('./friends');
const eventsRoute = require('./events');
const postsRoute = require('./posts');
const groupsRoute = require('./groups');
const chatsRoute = require('./chats');
// const rateLimit = require('express-rate-limit');
// const {rateLimiter} = require('./utils/function')

// const limiter = rateLimit({
//   windowMs: 1 * 1000, 
//   max: 100
// });


// app.use(limiter);

// app.use(rateLimiter);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


app.use('/api/1.0/users', usersRoute);
app.use('/api/1.0/friends', friendsRoute);
app.use('/api/1.0/events', eventsRoute);
app.use('/api/1.0/posts', postsRoute);
app.use('/api/1.0/groups', groupsRoute);
app.use('/api/1.0/chat', chatsRoute);


app.get('/healthcheck', (req, res) => {
  res.status(200).send('I am working!');
});


module.exports =  app;

