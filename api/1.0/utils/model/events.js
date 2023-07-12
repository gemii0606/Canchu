const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
const User = require('./users');
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
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  summary: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'events',
  timestamps: true
});

Event.belongsTo(User, { foreignKey: 'from_id', as: 'FromUser' })
Event.belongsTo(User, { foreignKey: 'to_id', as: 'ToUser' })

Event.sync().then(() => {
    Event.belongsTo(User, { foreignKey: 'id' });
  }).catch(error => {
    console.error('Error syncing Event model:', error);
  });

module.exports = Event;