const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('canchu', 'gemii0606', process.env.SQL_NODEJS_PW, {
  host: 'localhost',
  dialect: 'mysql'
});

class Friendship extends Model {}

Friendship.init({
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
  status: {
    type: DataTypes.ENUM('pending', 'friend'),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Friendship',
  tableName: 'friendships'
});


Friendship.associate = function(models) {
  Friendship.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'FromUser' });
  Friendship.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'ToUser' });
}

Friendship.sync()

module.exports = Friendship;