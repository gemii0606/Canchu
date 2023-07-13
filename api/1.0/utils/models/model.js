const User = require('./users');
const Friendship = require('./friendships');
const Event = require('./events');


// Friendship.associate = function(models) {
//     Friendship.belongsTo(User);
    // Friendship.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'FromUser' });
    // Friendship.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'ToUser' });
// }
  
// Event.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'EventFromUser' })
// Event.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'EventToUser' })


// User.associate = function(models) {
//     User.belongsTo(Friendship);
//     User.hasMany(Friendship, { foreignKey: 'to_id', sourceKey: 'id' });
//     User.hasMany(Event, { foreignKey: 'from_id', sourceKey: 'id' });
//     User.hasMany(Event, { foreignKey: 'to_id', sourceKey: 'id' });
//   }


// User.sync().then(() => {
//     User.associate = function(models) {
//         console.log('correct');
//         User.hasMany(Friendship);
//         // User.hasMany(Friendship, { foreignKey: 'to_id', sourceKey: 'id' });
//         // User.hasMany(Event, { foreignKey: 'from_id', sourceKey: 'id' });
//         // User.hasMany(Event, { foreignKey: 'to_id', sourceKey: 'id' });
//       }
// }).catch(error => {
//     console.error('Error syncing :', error);
// });

// Friendship.sync().then(() => {
//     Friendship.associate = function(models) {
//         Friendship.associate = function(models) {
//             Friendship.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'FromUser' });
//             Friendship.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'ToUser' });
//         }
//       }
// }).catch(error => {
//     console.error('Error syncing :', error);
// });

// Event.sync().then(() => {
//     Event.associate = function(models) {
//         Event.associate = function(models) {
//             Event.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'EventFromUser' })
//             Event.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'EventToUser' })
//         }
//       }
// }).catch(error => {
//     console.error('Error syncing :', error);
// });

User.hasMany(Friendship);
Friendship.belongsTo(User, { foreignKey: 'id'});

module.exports = {
    User,
    Friendship,
    Event
};

