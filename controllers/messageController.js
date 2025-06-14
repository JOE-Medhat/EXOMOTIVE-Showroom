const Message = require('../models/message');
const mongoose = require('mongoose');

// Get all messages
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get all messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message
        });
    }
};

// Get message by ID
exports.getMessageById = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Get message by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching message',
            error: error.message
        });
    }
};

// Create new message
exports.createMessage = async (req, res) => {
    try {
        const { fromName, fromEmail, subject, messageBody, userId } = req.body;
        console.log('[createMessage] Received userId:', userId);

        const message = new Message({
            fromName,
            fromEmail,
            subject,
            messageBody,
            read: false,
            userId: userId ? new mongoose.Types.ObjectId(userId) : undefined
        });

        await message.save();
        console.log('[createMessage] Message saved with userId:', message.userId);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            message: {
                _id: message._id,
                fromName: message.fromName,
                fromEmail: message.fromEmail,
                subject: message.subject,
                messageBody: message.messageBody,
                read: message.read,
                createdAt: message.createdAt
            }
        });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        message.read = true;
        await message.save();

        res.json({
            success: true,
            message: 'Message marked as read',
            message: {
                _id: message._id,
                fromName: message.fromName,
                fromEmail: message.fromEmail,
                subject: message.subject,
                messageBody: message.messageBody,
                read: message.read,
                createdAt: message.createdAt
            }
        });
    } catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking message as read',
            error: error.message
        });
    }
};

// Delete message
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: error.message
        });
    }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ read: false });
        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting unread count',
            error: error.message
        });
    }
};

// Get messages by user ID
exports.getMessagesByUser = async (req, res) => {
    try {
        console.log('[getMessagesByUser] req.params.id (from URL): ', req.params.id);
        console.log('[getMessagesByUser] req.user._id (from token): ', req.user._id);

        // Ensure the authenticated user can only view their own messages
        // Compare IDs as strings for reliable comparison
        if (String(req.params.id) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own messages.' });
        }

        // Find messages associated with the user's _id
        const userIdToQuery = req.user._id;
        console.log('[getMessagesByUser] Querying with userId:', userIdToQuery);

        const messages = await Message.find({ userId: userIdToQuery }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, messages });
    } catch (err) {
        console.error('Error fetching messages by user ID:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch user messages', error: err.message });
    }
}; 