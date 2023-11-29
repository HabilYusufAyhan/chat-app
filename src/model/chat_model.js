const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({

    mesaj: {
        type: Array,
        trim: true,
    },
    kullanici1: {
        type: String,
        trim: true
    },
    kullanici2: {
        type: String,
        trim: true
    }


}, { collection: 'mesajlar', timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;