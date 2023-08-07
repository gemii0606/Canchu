const User = require('./users');
const Friendship = require('./friendships');
const Event = require('./events');
const {Post, Like, Comment} = require('./posts');
const {Group, Groupmember, Grouppost} = require('./groups');
const Chat = require('./chats');

Promise.all([
    User.sync(),
    Friendship.sync(),
    Event.sync(),
    Post.sync(),
    Like.sync(),
    Comment.sync(),
    Group.sync(),
    Groupmember.sync(),
    Grouppost.sync(),
    Chat.sync(),
  ])
  .then(() => {
        User.hasMany(Friendship, { foreignKey: 'from_id', as: 'fromFriendship' });
        Friendship.belongsTo(User, { foreignKey: 'from_id', as: 'fromUser' });

        User.hasMany(Friendship, { foreignKey: 'to_id', as: 'toFriendship' });
        Friendship.belongsTo(User, { foreignKey: 'to_id', as: 'toUser' });

        User.hasMany(Event, { foreignKey: 'from_id', sourceKey: 'id', as: 'userFromEvent'});
        Event.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'eventToUser'});

        User.hasMany(Event, { foreignKey: 'to_id', sourceKey: 'id', as: 'userToEvent' });
        Event.belongsTo(User, { foreignKey: 'to_id', targetKey: 'id', as: 'eventFromUser'});

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

        Group.hasMany(Groupmember, { foreignKey: 'group_id', as: 'groupGroupmember' });
        Groupmember.belongsTo(Group, { foreignKey: 'group_id', as: 'groupmemberGroup' });

        Group.hasMany(Grouppost, { foreignKey: 'group_id', as: 'groupGrouppost' });
        Grouppost.belongsTo(Group, { foreignKey: 'group_id', as: 'grouppostGroup' });

        Groupmember.hasMany(Grouppost, { foreignKey: 'group_id', sourceKey: 'group_id', as: 'groupmemberGrouppost' });
        Grouppost.belongsTo(Groupmember, { foreignKey: 'group_id', targetKey: 'group_id', as: 'grouppostGroupmember' });

        User.hasMany(Groupmember, { foreignKey: 'user_id', as: 'userGroupmember' });
        Groupmember.belongsTo(User, { foreignKey: 'user_id', as: 'groupmemberUser' });

        User.hasMany(Group, { foreignKey: 'leader_id', as: 'userGroup' });
        Group.belongsTo(User, { foreignKey: 'leader_id', as: 'groupUser' });

        User.hasMany(Grouppost, { foreignKey: 'user_id', as: 'userGrouppost' });
        Grouppost.belongsTo(User, { foreignKey: 'user_id', as: 'grouppostUser' });

        User.hasMany(Chat, { foreignKey: 'sender_id', as: 'userChatSender' });
        Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'chatUserSender' });

        User.hasMany(Chat, { foreignKey: 'receiver_id', as: 'userChatReceiver' });
        Chat.belongsTo(User, { foreignKey: 'receiver_id', as: 'chatUserReceiver' });
  })
  .catch((err) => {
    console.error('Error occurred while creating tables:', err);
  });


module.exports = {
    User,
    Friendship,
    Event,
    Post,
    Like,
    Comment,
    Group,
    Groupmember,
    Grouppost,
    Chat
};

