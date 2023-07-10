const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'))

const usersRoute = require('./users');
app.use('/api/1.0/users', usersRoute);

const friendsRoute = require('./friends');
app.use('/api/1.0/friends', friendsRoute);

app.get('/api/1.0/friends/:user_id/request', (req, res) => {
  res.send('Hello, friends!');
});

app.get('/api/1.0/users/signin', (req, res) => {
  res.send('Hello2');
});


app.listen(3000, () => {
    console.log('The application is running on localhost:3000')
});
