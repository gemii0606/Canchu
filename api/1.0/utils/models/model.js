const User = require('./users');
const Friendship = require('./friendships');
const Event = require('./events');
const {Post, Like, Comment} = require('./posts');


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

User.hasMany(Friendship, { foreignKey: 'from_id', as: 'fromFriendship' });
Friendship.belongsTo(User, { foreignKey: 'from_id', as: 'fromUser' });

User.hasMany(Friendship, { foreignKey: 'to_id', as: 'toFriendship' });
Friendship.belongsTo(User, { foreignKey: 'to_id', as: 'toUser' });

User.hasMany(Event, { foreignKey: 'from_id', sourceKey: 'id' });
Event.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id'});

User.hasMany(Event, { foreignKey: 'to_id', sourceKey: 'id' });
Event.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id'});

User.hasMany(Post, { foreignKey: 'user_id', sourceKey: 'id', as: 'userPost'});
Post.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id', as: 'postUser'});

User.hasMany(Like, { foreignKey: 'liker_id', sourceKey: 'id', as: 'userLike' });
Like.belongsTo(User, { foreignKey: 'liker_id', targetKey: 'id', as: 'likeUser'});

User.hasMany(Comment, { foreignKey: 'commenter_id', sourceKey: 'id', as: 'userComment' });
Comment.belongsTo(User, { foreignKey: 'commenter_id', targetKey: 'id', as: 'commentUser'});

Post.hasMany(Like, { foreignKey: 'post_id', sourceKey: 'id', as: 'postLike'});
Like.belongsTo(Post, { foreignKey: 'post_id', targetKey: 'id', as: 'likePost'});

Post.hasMany(Comment, { foreignKey: 'post_id', sourceKey: 'id', as: 'postComment'});
Comment.belongsTo(Post, { foreignKey: 'post_id', targetKey: 'id', as: 'commentPost'});


module.exports = {
    User,
    Friendship,
    Event,
    Post,
    Like,
    Comment
};

