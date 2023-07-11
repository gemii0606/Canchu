const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'gemii0606',
    password: process.env.SQL_NODEJS_PW,
    database: 'canchu',
});








module.exports = pool;
