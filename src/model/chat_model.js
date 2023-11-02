const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    id: {
        type: String,
        trim: true
    },
    mesaj: {
        type: String,
        trim: true,
    },


}, { collection: 'mesajlar', timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;