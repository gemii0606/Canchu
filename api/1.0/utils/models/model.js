const User = require('./users');
const Friendship = require('./friendships');
const Event = require('./events');



User.associate = function(models) {
    User.hasMany(Friendship, { foreignKey: 'from_id', sourceKey: 'id' });
    User.hasMany(Friendship, { foreignKey: 'to_id', sourceKey: 'id' });
    User.hasMany(Event, { foreignKey: 'from_id', sourceKey: 'id' });
    User.hasMany(Event, { foreignKey: 'to_id', sourceKey: 'id' });
  }
  
Friendship.associate = function(models) {
    Friendship.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'FromUser' });
    Friendship.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'ToUser' });
}
  
Event.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'FromUser' })
Event.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'ToUser' })

User.sync()
Friendship.sync()
Event.sync().then(() => {
    Event.belongsTo(User, { foreignKey: 'id' });
}).catch(error => {
    console.error('Error syncing Event model:', error);
});

module.exports = {
    User,
    Friendship,
    Event
};