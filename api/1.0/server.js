const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json());

const usersRoute = require('./users');
app.use('/api/1.0/users', usersRoute);


app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/api/1.0/users/signin', (req, res) => {
  res.send('Hello2');
});


app.listen(3000, () => {
    console.log('The application is running on localhost:3000')
});
