const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('canchu', 'gemii0606', process.env.SQL_NODEJS_PW, {
  host: 'localhost',
  dialect: 'mysql'
});

const User = sequelize.define('User', {}, { tableName: 'users', timestamps: false });

// User.associate = function(models) {
//   User.hasMany(Friendship, { foreignKey: 'from_id', sourceKey: 'id' });
//   User.hasMany(Friendship, { foreignKey: 'to_id', sourceKey: 'id' });
//   User.hasMany(Event, { foreignKey: 'from_id', sourceKey: 'id' });
//   User.hasMany(Event, { foreignKey: 'to_id', sourceKey: 'id' });
// }

User.associate = function(models) {
  User.belongsTo(Friendship);
};

User.sync()
module.exports = User;