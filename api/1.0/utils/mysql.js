// const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'gemii0606',
//     password: process.env.SQL_NODEJS_PW,
//     database: 'canchu',
// });


const sequelize = new Sequelize('canchu', 'root', 'gG01020304', {
    host: 'canchu-database-1.cqhttrqtpt3n.ap-southeast-2.rds.amazonaws.com',
    dialect: 'mysql'
  });


module.exports = sequelize;
// module.exports = pool;
