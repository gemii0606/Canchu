const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
const User = require('./users');
const Friendship = require('./friendships');
require('dotenv').config();

const sequelize = new Sequelize('canchu', 'gemii0606', process.env.SQL_NODEJS_PW, {
  host: 'localhost',
  dialect: 'mysql'
});

class Event extends Model {}

Event.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  from_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  to_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING
  },
  is_read: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  image: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  summary: {
    type: DataTypes.ENUM('pending', 'friend'),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'Events'
});

Event.sync()
Event.belongsTo(Friendship, { foreignKey: 'from_id', as: 'FromUser' })
Event.belongsTo(Friendship, { foreignKey: 'to_id', as: 'ToUser' })

module.exports = Event;