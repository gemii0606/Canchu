const express = require('express');
const app = express();
const usersRoute = require('./users');
const friendsRoute = require('./friends');
const eventsRoute = require('./events');

app.use(express.json());
app.use(express.static('public'))


app.use('/api/1.0/users', usersRoute);


app.use('/api/1.0/friends', friendsRoute);
app.use('/api/1.0/events', eventsRoute);




// app.get('/api/1.0/friends/:user_id/request', async (req, res) => {
//   console.log('1');
//   const friendship = await Friendship.create({ from_id: 1, to_id: 2 });
//   res.send('Hello,friend!');
// });

app.get('/api/1.0/users/signin', (req, res) => {
  res.send('Hello2');
});


app.listen(3000, () => {
    console.log('The application is running on localhost:3000')
});
