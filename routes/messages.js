const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// GET all messages
router.get('/', auth, messageController.getAllMessages);

// GET unread message count (should be BEFORE :id route)
router.get('/unreadCount', auth, messageController.getUnreadCount);

// GET messages by user ID
router.get('/user/:id', auth, messageController.getMessagesByUser);

// GET single message by ID (should be AFTER all more specific routes)
router.get('/:id', auth, messageController.getMessageById);

// POST: Create a new message
router.post('/', messageController.createMessage);

// DELETE a message
router.delete('/:id', auth, messageController.deleteMessage);

// PUT mark message as read
router.put('/:id/markRead', auth, messageController.markAsRead);

module.exports = router; 