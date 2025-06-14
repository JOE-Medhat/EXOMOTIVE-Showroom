const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    fromName: {
        type: String,
        required: true,
        trim: true
    },
    fromEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    subject: {
        type: String,
        trim: true
    },
    messageBody: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'Messages', versionKey: false });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 