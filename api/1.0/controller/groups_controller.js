const {User, Post, Group, Groupmember} = require('../utils/models/model');
const { Op } = require('sequelize');

const createGroup = async (req, res) => {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;

    const {name} = req.body;

    if (!name) {
        return res.status(400).json({error: 'group name should not be empty!'})
    }

    const group = await Group.create({
        name,
        leader_id: user_id
      });

    const data = {
        group: {
            id: group.id
        }
    }
    return res.status(200).json({data});
}

const groupDelete = async (req, res) => {
    const group_id = parseInt(req.params.group_id); 
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;

    const find_group = await Group.findOne({
      where: {
        id: group_id,
        leader_id: user_id
      }
    });

    if (!find_group) {
      return res.status(400).json({ error: 'Group is not found or you are not leader.' });
    }

    // Delete the like entry from the database
    const delete_action = await Group.destroy({
      where: {
        id: group_id
      }
    });

    const data = {
        group: {
            id: group_id
        }
    }
    // Send the response with the post information
    return res.status(200).json({data});
}

const groupJoin = async (req, res) => {
    const group_id = parseInt(req.params.group_id); 
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;

    const find_group = await Group.findOne({
        where: {
          id: group_id
        }
      });
  
      if (!find_group) {
        return res.status(400).json({ error: 'Group not found.' });
      }

    const find_group_leader = await Group.findOne({
      where: {
        id: group_id,
        leader_id: user_id
      }
    });

    if (find_group_leader) {
      return res.status(400).json({ error: 'Leader has no ability to join your own group' });
    }

    const find_groupmember = await Groupmember.findOne({
        where: {
          group_id: group_id,
          user_id: user_id
        }
      });
    
    if (find_groupmember) {
        return res.status(400).json({ error: 'Your request has already been sent.' });
    }

    // Delete the like entry from the database
    const join_group = await Groupmember.create({
        group_id,
        user_id
    });

    const data = {
        group: {
            id: group_id
        }
    }
    // Send the response with the post information
    return res.status(200).json({data});
}

const groupPending = async (req, res) => {
    const group_id = parseInt(req.params.group_id);  
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;

    const find_group_leader = await Group.findOne({
      where: { id: group_id, leader_id: user_id}
    });

    if (!find_group_leader) {
        return res.status(400).json({error: 'Permission denied.'});
    }

    const groupmember_info = await Groupmember.findAll({
      where: { group_id, status: 'pending' },
      attributes: ['id', 'group_id', 'user_id','status'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'picture'],
          as: 'groupmemberUser', // Use 'fromUser' as the alias for the User model in the Friendship association
        },
      ],
    });

    // Reform the data to get the desired format
    const users = groupmember_info.map((groupmember) => {
      const result = {
        id: groupmember.groupmemberUser.id,
        name: groupmember.groupmemberUser.name,
        picture:groupmember.groupmemberUser.picture,
        status: groupmember.status
      };
      return result;
    });

    // Send the response with the formatted users data
    return res.status(200).json({ data: { users } });
}

const groupMemberAgree = async (req, res) => {
    const group_id = parseInt(req.params.group_id);
    const user_id = parseInt(req.params.user_id);
    const decodedToken = req.decodedToken;
    const id = decodedToken.id;

    const find_groupmember = await Groupmember.findOne({
        where: {
          group_id: group_id,
          user_id: user_id
        }
      });

    if (!find_groupmember) {
        return res.status(400).json({error: 'No result.'});
    }

    if (find_groupmember.status === 'member') {
        return res.status(400).json({error: 'The user has been already a member.'});
    }

    find_groupmember.status = 'member'
    await find_groupmember.save();

    const data = {
        user: {
            id: find_groupmember.user_id
        }
    }
    return res.status(200).json({data});
}

// const groupPost = async (req, res) => {
//     const group_id = parseInt(req.params.group_id);  
//     const decodedToken = req.decodedToken;
//     const user_id = decodedToken.id;

//     const find_post = await Post.findAll
// }

module.exports = {
    createGroup,
    groupDelete,
    groupJoin,
    groupPending,
    groupMemberAgree
}