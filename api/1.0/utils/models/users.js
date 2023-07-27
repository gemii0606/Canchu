const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

// const sequelize = new Sequelize(process.env.DATABASE, 'gemii0606', process.env.SQL_NODEJS_PW, {
//   host: 'localhost',
//   dialect: 'mysql'
// });

const sequelize = require('../mysql')

const User = sequelize.define('User', {
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
  tableName: 'users',
  timestamps: false
});

// User.associate = function(models) {
//   User.hasMany(Friendship, { foreignKey: 'from_id', sourceKey: 'id' });
//   User.hasMany(Friendship, { foreignKey: 'to_id', sourceKey: 'id' });
//   User.hasMany(Event, { foreignKey: 'from_id', sourceKey: 'id' });
//   User.hasMany(Event, { foreignKey: 'to_id', sourceKey: 'id' });
// }

// User.associate = function(models) {
//   User.hasOne(Friendship);
// };

User.sync()
module.exports = User;