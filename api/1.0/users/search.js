const express = require('express');
const router = express.Router();
const { User, Friendship } = require('../utils/models/model');
const { Op } = require('sequelize');

// Import the checkAuthorization function from utils/function
const { checkAuthorization } = require('../utils/function');

// Route for handling user search by keyword
router.get('/', checkAuthorization, async (req, res) => {
    const decodedToken = req.decodedToken;
    const user_id = decodedToken.id;
    const { keyword } = req.query;

    // Find users whose names contain the provided keyword
    const query_users = await User.findAll({
        where: {
            id: {
                [Op.not]: user_id
            },
            name: {
                [Op.like]: `%${keyword}%`
            }
        },
        attributes: ['id', 'name', 'picture']
    });

    let users = [];
    // Loop through the users found and check their friend status
    for (const other of query_users) {
        const [friendship] = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { [Op.and]: [{ from_id: user_id }, { to_id: other.id }] },
                    { [Op.and]: [{ from_id: other.id }, { to_id: user_id }] }
                ]
            }
        });

        // If no friendship exists, add the user data with friendship set to null
        if (!friendship) {
            const data = {
                id: other.dataValues.id,
                name: other.dataValues.name,
                picture: other.dataValues.picture,
                friendship: null
            };
            users.push(data);
            continue;
        }

        // Check the status of the friendship and add user data accordingly
        if (friendship.dataValues.from_id === user_id && friendship.dataValues.status === 'pending') {
            const data = {
                id: other.dataValues.id,
                name: other.dataValues.name,
                picture: other.dataValues.picture,
                friendship: {
                    id: friendship.dataValues.id,
                    status: 'requested'
                }
            };
            users.push(data);
        } else if (friendship.dataValues.to_id === user_id && friendship.dataValues.status === 'pending') {
            const data = {
                id: other.dataValues.id,
                name: other.dataValues.name,
                picture: other.dataValues.picture,
                friendship: {
                    id: friendship.dataValues.id,
                    status: 'pending'
                }
            };
            users.push(data);
        } else if (friendship.dataValues.status === 'friend') {
            const data = {
                id: other.dataValues.id,
                name: other.dataValues.name,
                picture: other.dataValues.picture,
                friendship: {
                    id: friendship.dataValues.id,
                    status: 'friend'
                }
            };
            users.push(data);
        }
    }

    // Return the list of users with their friend status
    return res.status(200).json({data: {users: users}});
});

module.exports = router;
