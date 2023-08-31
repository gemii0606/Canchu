// const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// const pool = mysql.createPool({
//     host: process.env.HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PW,
//     database: process.env.DB_NAME,
// });


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  });


module.exports = sequelize;
// module.exports = pool;
