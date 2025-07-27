const express = require('express');
const router = express.Router();

// Import controllers
const {
  sendMessage,
  getRoomMessages,
  markMessagesAsRead,
  getUnreadCount,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  getUserChatRooms,
  getOnlineUsers,
  searchMessages,
  getChatStats
} = require('../controllers/chatController');

// Import middleware
const { protect } = require('../middlewares/auth');
const { validateChatMessage } = require('../middlewares/validators');

// Protect all routes
router.use(protect);

// Message routes
router.post('/send', validateChatMessage, sendMessage);
router.get('/room/:roomId', getRoomMessages);
router.put('/room/:roomId/read', markMessagesAsRead);
router.get('/unread/:roomId', getUnreadCount);

// Message management routes
router.put('/message/:messageId', editMessage);
router.delete('/message/:messageId', deleteMessage);

// Reaction routes
router.post('/message/:messageId/reaction', addReaction);
router.delete('/message/:messageId/reaction', removeReaction);

// User and room routes
router.get('/rooms', getUserChatRooms);
router.get('/online-users', getOnlineUsers);
router.get('/search', searchMessages);
router.get('/stats', getChatStats);

module.exports = router;
