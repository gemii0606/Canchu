const { User, Friendship, Event } = require('../utils/models/model');
const Redis = require('ioredis');
const redisClient = new Redis();

const friendRequest = async (req, res) => {
    // Get the user ID of the receiver from the request URL
    const reqUserId = req.params.user_id;
    const decodedToken = req.decodedToken;
    const from_id = decodedToken.id;
    const to_id = parseInt(reqUserId);
  
    // Check if the user to befriend exists
    const user = await User.findOne({ where: { id: to_id } });
  
    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }
  
    // Check if the sender is trying to friend themselves
    if (from_id === to_id) {
      return res.status(400).json({ error: 'You cannot make friend with yourself.' });
    }
  
    // Check if a friend request has already been sent from the sender to the receiver
    const AtoB = await Friendship.findOne({ where: { from_id, to_id } });
  
    if (AtoB) {
      return res.status(400).json({ error: 'The friend request has already been sent.' });
    }
  
    // Check if the receiver has already sent a friend request to the sender
    const BtoA = await Friendship.findOne({ where: { from_id: to_id, to_id: from_id } });
  
    if (BtoA && BtoA.status === 'pending') {
      return res.status(400).json({ error: 'He/She is waiting for your acceptance.' });
    }
  
    // Check if the sender and receiver are already friends
    if (BtoA && BtoA.status === 'accepted') {
      return res.status(400).json({ error: 'You are already friends.' });
    }
  
    // Create a friendship entry in the friendships table to represent the friend request
    const friendship = await Friendship.create({
      from_id,
      to_id
    });
  
    // Get the sender's name from users
    const request_event = await User.findOne({
      where: { id: from_id },
      attributes: ['name']
    });
  
    // Create a friend request event in the events table
    const events = await Event.create({
      from_id,
      to_id,
      type: 'friend_request',
      is_read: false,
      summary: `${request_event.dataValues.name} invited you to be friends.`
    });
  
    // Delete the receiver's friendship info from Redis to ensure it gets updated
    const deleteKey = `user:${to_id}:friendship:${from_id}`;
    await redisClient.del(deleteKey);
  
    return res.status(200).json({ data: { friendship: { id: friendship.id } } });
  }

const friendPending = async (req, res) => {
    const decodedToken = req.decodedToken;
    const to_id = decodedToken.id; // Get the receiver's ID from the decoded token

    // Get the pending friend requests info from the friendships table,
    // and include the associated sender's info from the users table
    const friendships_info = await Friendship.findAll({
      where: { to_id, status: 'pending' },
      attributes: ['id', 'from_id', 'to_id'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'picture'],
          as: 'fromUser', // Use 'fromUser' as the alias for the User model in the Friendship association
        },
      ],
    });

    // Reform the data to get the desired format
    const users = friendships_info.map((friend) => {
      const user_info = friend.fromUser.dataValues; // Get the sender's info from the associated User model
      const data = {
        ...user_info,
        friendship: {
          id: friend.id,
          status: 'pending',
        },
      };
      return data;
    });

    // Send the response with the formatted users data
    return res.status(200).json({ data: { users } });
}

const friendGet = async (req, res) => {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id; // Get the user's ID from the decoded token
    
    // Find the user's friendships where status is 'friend' and include the associated User models
    const [friends] = await User.findAll({
      where: { id: user_id },
      attributes: [],
      include: [
        {
          model: Friendship,
          as: 'fromFriendship',
          where: { status: 'friend' },
          attributes: ['id', 'from_id', 'to_id', 'status'],
          include: [
            {
              model: User,
              as: 'toUser', // Use 'toUser' as the alias for the User model in the 'fromFriendship' association
              attributes: ['id', 'name', 'picture'],
            },
          ],
          required: false,
        },
        {
          model: Friendship,
          as: 'toFriendship',
          where: { status: 'friend' },
          attributes: ['id', 'from_id', 'to_id', 'status'],
          include: [
            {
              model: User,
              as: 'fromUser', // Use 'fromUser' as the alias for the User model in the 'toFriendship' association
              attributes: ['id', 'name', 'picture'],
            },
          ],
          required: false,
        },
      ],
      required: false,
    });

    const result = [];

    // Loop through the 'fromFriendship' associations and add the friend's info to the result array
    if (friends.fromFriendship.length > 0) {
      for (const friend of friends.fromFriendship) {
        let userObj = {};
        userObj.id = friend.toUser.id;
        userObj.name = friend.toUser.name;
        userObj.picture = friend.toUser.picture;
        userObj.friendship = {
          id: friend.id,
          status: friend.status,
        };
        result.push(userObj);
      }
    }

    // Loop through the 'toFriendship' associations and add the friend's info to the result array
    if (friends.toFriendship.length > 0) {
      for (const friend of friends.toFriendship) {
        let userObj = {};
        userObj.id = friend.fromUser.id;
        userObj.name = friend.fromUser.name;
        userObj.picture = friend.fromUser.picture;
        userObj.friendship = {
          id: friend.id,
          status: friend.status,
        };
        result.push(userObj);
      }
    }

    const responseData = {
      users: result,
    };

    // Send the response with the formatted users data
    res.status(200).json({ data: responseData });
}

const friendAgree = async (req, res) => {
    // Extract the friendship ID from the request URL
    const reqFriendshipId = req.params.friendship_id;
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const friendship_id = parseInt(reqFriendshipId); // Get the ID of the friendship from the request

    // Find the friendship to be accepted
    const friendship = await Friendship.findOne({
      where: { id: friendship_id },
    });

    // Check if the friendship status is already 'friend'
    if (friendship.status === 'friend') {
      return res.status(400).json({ error: 'You are already friends.' });
    }

    // Check if the current user is the receiver of the friend request
    if (friendship.from_id === user_id) {
      return res.status(400).json({ error: 'You are not the receiver.' });
    }

    // Update the status of the friendship to 'friend'
    friendship.status = 'friend';
    await friendship.save(); // Save this change permanently in the database

    // Find the user's ID and name who sent the friend request
    const accept_event = await User.findOne({
      where: { id: friendship.from_id },
      attributes: ['id', 'name'],
    });

    // Create an 'accept' event in the events table. Note: when sending an agree message, you are the sender.
    const events = await Event.create({
      from_id: user_id,
      to_id: accept_event.dataValues.id,
      type: 'friend_accept',
      is_read: false,
      summary: `${accept_event.dataValues.name} has accepted your friend request.`,
    });

    // Delete the associated Redis key to remove cached data
    const deleteKey = `user:${friendship.to_id}:friendship:${user_id}`;
    await redisClient.del(deleteKey);

    return res.status(200).json({ data: { friendship: { id: friendship.id } } });
}

const friendDelete = async (req, res) => {
    const reqFriendshipId = req.params.friendship_id;
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const delete_id = parseInt(reqFriendshipId); // Get the ID of the friendship to delete from the request

    // Find the friendship to be deleted
    const delete_target = await Friendship.findOne({
      where: { id: delete_id },
    });

    // Check if the friendship exists
    if (!delete_target) {
      return res.status(400).json({ error: 'No relationship is found.' });
    }

    // Delete the friendship from the database
    const delete_action = await Friendship.destroy({
      where: { id: delete_id },
    });

    // Delete the associated Redis keys to remove cached data
    const deleteKey_1 = `user:${delete_target.from_id}:friendship:${delete_target.to_id}`;
    const deleteKey_2 = `user:${delete_target.to_id}:friendship:${delete_target.from_id}`;
    await redisClient.del([deleteKey_1, deleteKey_2]);

    return res.status(200).json({ data: { friendship: delete_id } });
}

module.exports ={
    friendRequest,
    friendPending,
    friendGet,
    friendAgree,
    friendDelete
}