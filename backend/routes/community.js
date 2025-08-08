const express = require('express');
const router = express.Router();

// Import controllers
const {
  createCommunity,
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
  sendMessage,
  updateCommunity,
  deleteCommunity,
  getUserCommunities,
  searchCommunities,
  getCategories
} = require('../controllers/communityController');

const {
  addReaction,
  removeReaction,
  editMessage,
  deleteMessage,
  reportMessage,
  moderateMessage,
  togglePinMessage,
  voteInPoll,
  getReportedMessages,
  getPinnedMessages,
  searchMessages
} = require('../controllers/communityMessageController');

// Import middleware
const { protect } = require('../middlewares/auth');
const { 
  validateCommunity, 
  validateCommunityMessage, 
  validateReaction,
  validateReport,
  validateModeration 
} = require('../middlewares/validators');

// Protect all routes
router.use(protect);

// Community routes
router.post('/', validateCommunity, createCommunity);
router.get('/', getCommunities);
router.get('/categories', getCategories);
router.get('/search', searchCommunities);
router.get('/user/me', getUserCommunities);

// Community management routes
router.get('/:id', getCommunity);
router.post('/:id/join', joinCommunity);
router.post('/:id/leave', leaveCommunity);
router.put('/:id', validateCommunity, updateCommunity);
router.delete('/:id', deleteCommunity);

// Message routes
router.get('/:id/messages', getCommunityMessages);
router.post('/:id/messages', validateCommunityMessage, sendMessage);
router.get('/:id/pinned', getPinnedMessages);
router.get('/:id/reports', getReportedMessages);
router.get('/:id/search', searchMessages);

// Message management routes
router.post('/message/:id/reaction', validateReaction, addReaction);
router.delete('/message/:id/reaction', validateReaction, removeReaction);
router.put('/message/:id', validateCommunityMessage, editMessage);
router.delete('/message/:id', deleteMessage);
router.post('/message/:id/report', validateReport, reportMessage);
router.post('/message/:id/moderate', validateModeration, moderateMessage);
router.post('/message/:id/pin', togglePinMessage);
router.post('/message/:id/vote', voteInPoll);

module.exports = router; 