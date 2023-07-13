const User = require('./users');
const Friendship = require('./friendships');

const models = { User, Friendship };
// 添加其他模型

Object.values(models)
  .filter(model => typeof model.associate === "function")
  .forEach(model => model.associate(models));