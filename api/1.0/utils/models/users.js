const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = require('../mysql')

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  introduction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users'
});

User.sync()
module.exports = User;