// const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// const pool = mysql.createPool({
//     host: process.env.HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PW,
//     database: process.env.DB_NAME,
// });

// Create a Sequelize instance to connect to the MySQL database
// Use environment variables for the database name (process.env.DB_NAME), user (process.env.DB_USER), and password (process.env.DB_PW)
// Use the database host address from environment variables (process.env.DB_HOST)
// Use the MySQL dialect (dialect: 'mysql')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  });


module.exports = sequelize;
// module.exports = pool;
