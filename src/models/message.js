const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageModel = new Schema({
    username: {
        type: String
    },
    content: {
        type: String
    },
    groupId: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }
});
module.exports = mongoose.model('Message', messageModel, 'messages');