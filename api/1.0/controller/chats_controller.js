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


module.exports ={
    createChat
}