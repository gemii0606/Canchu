const { Sequelize } = require('sequelize');
const { Model, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = require('../mysql')

class Post extends Model {}

Post.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  modelName: 'Post',
  tableName: 'posts'
});

class Like extends Model {}

Like.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  liker_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Like',
  tableName: 'likes'
});

class Comment extends Model {}

Comment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commenter_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'Commente',
  tableName: 'comments'
});

Post.sync()
  .then(() => {
    console.log('Post table has been created!');
    // 當 Post 表格建立完成後，建立 Like 表格
    return Like.sync();
  })
  .then(() => {
    console.log('Like table has been created!');
    // 當 Like 表格建立完成後，建立 Comment 表格
    return Comment.sync();
  })
  .then(() => {
    console.log('Comment table has been created!');
    // 所有表格建立完成
  })
  .catch((err) => {
    console.error('Error occurred while creating tables:', err);
  });

module.exports = {
    Post,
    Like,
    Comment
};