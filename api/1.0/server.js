const express = require('express');

console.log('server 1');
const app = express();
console.log('server 2');
app.use(express.json());
app.use(express.static('public'))

const usersRoute = require('./users');
app.use('/api/1.0/users', usersRoute);
console.log('server 3');
const friendsRoute = require('./friends');
app.use('/api/1.0/friends', friendsRoute);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/api/1.0/users/signin', (req, res) => {
  res.send('Hello2');
});


app.listen(3000, () => {
    console.log('The application is running on localhost:3000')
});
