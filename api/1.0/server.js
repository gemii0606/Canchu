const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'))

const usersRoute = require('./users');
app.use('/api/1.0/users', usersRoute);

const friendsRoute = require('./friends');
app.use('/api/1.0/friends', friendsRoute);

const Friendship = require('./utils/model/friendships');


app.get('/api/1.0/friends/:user_id/request', async (req, res) => {
  console.log('1');
  const friendship = await Friendship.create({ 1, 2 });
  res.send('Hello,friend!');
});

app.get('/api/1.0/users/signin', (req, res) => {
  res.send('Hello2');
});


app.listen(3000, () => {
    console.log('The application is running on localhost:3000')
});
