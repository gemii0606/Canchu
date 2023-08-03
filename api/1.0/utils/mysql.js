// const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'gemii0606',
//     password: process.env.SQL_NODEJS_PW,
//     database: 'canchu',
// });


const sequelize = new Sequelize(process.env.DATABASE, 'gemii0606', process.env.SQL_NODEJS_PW, {
    host: 'canchu_mysql',
    dialect: 'mysql'
  });


module.exports = sequelize;
// module.exports = pool;
