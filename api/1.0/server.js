const express = require('express');
const app = express();
const usersRoute = require('./users');
const friendsRoute = require('./friends');
const eventsRoute = require('./events');
const postsRoute = require('./posts');


app.use(express.json());
app.use(express.static('public'))


app.use('/api/1.0/users', usersRoute);


app.use('/api/1.0/friends', friendsRoute);
app.use('/api/1.0/events', eventsRoute);
app.use('/api/1.0/posts', postsRoute);



// app.get('/api/1.0/users/search', async (req, res) => {
//   console.log('1');
//   res.send('Hello,friend!');
// });

app.get('/api/1.0/users/signin', (req, res) => {
  res.send('Hello2');
});


app.listen(3000, () => {
    console.log('The application is running on localhost:3000')
});
