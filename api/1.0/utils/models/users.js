const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('canchu', 'gemii0606', process.env.SQL_NODEJS_PW, {
  host: 'localhost',
  dialect: 'mysql'
});

const User = sequelize.define('User', {}, { tableName: 'users', timestamps: false });


module.exports = User;