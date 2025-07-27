const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  analyzeEmotion,
  getEmotionHistory,
  getEmotionTrends,
  getEmotionDistribution,
  getEmotionInsights,
  getEmotionSession,
  updateEmotionContext,
  deleteEmotionData
} = require('../controllers/emotionController');

// All routes are protected and require authentication
router.use(protect);

// POST /api/emotions/analyze - Store emotion analysis data
router.post('/analyze', analyzeEmotion);

// GET /api/emotions/history - Get user's emotion history
router.get('/history', getEmotionHistory);

// GET /api/emotions/trends - Get emotion trends and analytics
router.get('/trends', getEmotionTrends);

// GET /api/emotions/distribution - Get emotion distribution
router.get('/distribution', getEmotionDistribution);

// GET /api/emotions/insights - Get emotion insights and recommendations
router.get('/insights', getEmotionInsights);

// GET /api/emotions/session/:sessionId - Get emotion session data
router.get('/session/:sessionId', getEmotionSession);

// PUT /api/emotions/:id/context - Update emotion data context
router.put('/:id/context', updateEmotionContext);

// DELETE /api/emotions/:id - Delete emotion data
router.delete('/:id', deleteEmotionData);

module.exports = router;
