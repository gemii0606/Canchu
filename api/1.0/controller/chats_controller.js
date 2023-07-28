const {User, Chat} = require('../utils/models/model');
const { Op } = require('sequelize');
const moment = require('moment');

const createChat = async (req, res) => {
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