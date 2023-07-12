const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
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
      model: 'friendships',
      key: 'from_id'
    }
  },
  to_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'friendships',
      key: 'to_id'
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

Event.sync().then(() => {
    Event.belongsTo(Friendship, { foreignKey: 'from_id' });
    Event.belongsTo(Friendship, { foreignKey: 'to_id' });
  }).catch(error => {
    console.error('Error syncing Event model:', error);
  });

module.exports = Event;