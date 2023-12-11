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
    Okundu: {
        type: Boolean,
        default: false
    }



}, { collection: 'Okundu', timestamps: true });

const Okundu = mongoose.model('Okundu', chatSchema);

module.exports = Okundu;