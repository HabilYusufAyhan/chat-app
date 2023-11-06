const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    user1: {
        type: String,
        trim: true
    },
    user2: {
        type: String,
        trim: true,
    },



}, { collection: 'room', timestamps: true });

const Room = mongoose.model('Room', chatSchema);

module.exports = Room;