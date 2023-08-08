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
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4', // 設置字符集
      collate: 'utf8mb4_unicode_ci', // 設置校對規則
    }
  });


module.exports = sequelize;
// module.exports = pool;
