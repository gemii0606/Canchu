const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = require('../mysql')

class Grouppost extends Model {}

Grouppost.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  context: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'Grouppost',
  tableName: 'groupposts'
});

Grouppost.sync()
module.exports = Grouppost;