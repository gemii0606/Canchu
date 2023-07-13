const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
// const Friendship = require('./friendships');
// const Event = require('./events');
require('dotenv').config();

const sequelize = new Sequelize('canchu', 'gemii0606', process.env.SQL_NODEJS_PW, {
  host: 'localhost',
  dialect: 'mysql'
});

const User = sequelize.define('User', {}, { tableName: 'users', timestamps: false });

User.associate = function(models) {
  User.hasMany(models.Friendship, { foreignKey: 'from_id', sourceKey: 'id' });
  User.hasMany(models.Friendship, { foreignKey: 'to_id', sourceKey: 'id' });
  User.hasMany(models.Event, { foreignKey: 'from_id', sourceKey: 'id' });
  User.hasMany(models.Event, { foreignKey: 'to_id', sourceKey: 'id' });
}

User.sync()


module.exports = User;