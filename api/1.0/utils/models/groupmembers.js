const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = require('../mysql')

class Groupmember extends Model {}

Groupmember.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.STRING,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'member'),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Groupmember',
  tableName: 'groupmembers'
});

Groupmember.sync()
module.exports = Groupmember;