const {User, Chat} = require('../utils/models/model');
const { Op } = require('sequelize');
const moment = require('moment');

const createChat = async (req, res) => {
    const receiver_id = parseInt(req.params.user_id); 
    const decodedToken = req.decodedToken;
    const sender_id = decodedToken.id;

    const {message} = req.body;

    if (!message) {
        return res.status(400).json({error: 'Message should not be empty!'})
    }

    const find_user = await User.findOne({
        where: {id: receiver_id}
    })

    if (!find_user) {
        return res.status(400).json({error: 'User not found!'})
    }

    const chat = await Chat.create({
        sender_id,
        receiver_id,
        message
      });

    const data = {
        message: {
            id: chat.id
        }
    }
    return res.status(200).json({data});
}

const getChat = async (req, res) => {
    const other_id = parseInt(req.params.user_id);
    const decodedToken = req.decodedToken;
    const self_id = decodedToken.id; // Current user's ID

    let { cursor } = req.query;
    // Acquire the cursor info to determine the starting point for pagination
    let last_id;
    if (cursor) {
      last_id = parseInt(atob(cursor));
    } else {
      last_id = 18446744073709551615n; // Set a default large value if cursor is not provided
    }

    const pageSize = 10;
    const chats = await Chat.findAll({
        where: {
            [Op.or]: [
                { sender_id: self_id, receiver_id: other_id },
                { sender_id: other_id , receiver_id: self_id}
            ],
            id: { [Op.lt]: last_id }
        },
        attributes: ['id', 'message', 'createdAt'],
        order: [['id', 'DESC']],
        limit: pageSize + 1,
        include: {
            model: User,
            as: 'chatUserSender',
            attributes: ['id', 'name', 'picture']
        }
      });

      let next_cursor = null;
      if (chats.length > pageSize) {
        chats.pop();
        let cursor_info = chats[chats.length - 1].id;
        next_cursor = btoa(cursor_info.toString());
      }

      const messages = chats.map( (chat) => {
        const result = {
            id: chat.id,
            message: chat.message,
            created_at: moment.utc(chat.createdAt).utcOffset(8).format("YYYY-MM-DD HH:mm:ss"),
            user: {
                id: chat.chatUserSender.id,
                name: chat.chatUserSender.name,
                picture: chat.chatUserSender.picture
            }
        };
        return result;
      });
      const data = {
        messages,
        next_cursor
      }

      return res.status(200).json({ data });
}

module.exports ={
    createChat,
    getChat
}