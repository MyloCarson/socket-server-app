const express = require('express');
const Group = require('../models/group');
const groupRouter = express.Router();

groupRouter.get('/', (req, res, next) => {
    Group.find({})
    .then( groups => {
        res.status(200)
        .json(groups);
    })
    .catch( err => {
        // const err = new Error() // you can customize your error message if you want to.
        next(err);
    })
})

.post('/', (req, res, next) => {
    const group = new Group(req.body);
    group.save()
    .then( group => {
        /**
         * It makes sense to newly created groups to everyone connected to the groupSocket
         * So lets goHead
         */
        const groupSocket = req.groupSocket; // get our socket stored in the  request
        groupSocket.emit('group', group); // emits a payload to everyone
        res.status(201)
        .json(group);
    })
    .catch( err => {
        // const err = new Error() // you can customize your error message if you want to.
        next (err);
    })
})

module.exports = groupRouter;