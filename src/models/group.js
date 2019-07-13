const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupModel = new Schema({
    name: {
        type: String
    }
});

module.exports = mongoose.model('Group', groupModel, 'groups');