// const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'gemii0606',
//     password: process.env.SQL_NODEJS_PW,
//     database: 'canchu',
// });


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
    host: process.env.RDS_HOST,
    dialect: 'mysql'
  });


module.exports = sequelize;
// module.exports = pool;
