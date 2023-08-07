const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = require('../mysql')

class Group extends Model {}

Group.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  leader_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Group',
  tableName: 'groups'
});

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
  },
  user_id: {
    type: DataTypes.INTEGER,
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

Group.sync()
  .then(() => {
    console.log('Post table has been created!');
    // 當 Post 表格建立完成後，建立 Like 表格
    return Groupmember.sync();
  })
  .then(() => {
    console.log('Like table has been created!');
    // 當 Like 表格建立完成後，建立 Comment 表格
    return Grouppost.sync();
  })
  .then(() => {
    console.log('Comment table has been created!');
    // 所有表格建立完成
  })
  .catch((err) => {
    console.error('Error occurred while creating tables:', err);
  });

module.exports = {
  Group,
  Groupmember,
  Grouppost
};