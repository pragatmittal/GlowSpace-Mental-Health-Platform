const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { validateMoodEntry } = require('../middlewares/validators');
const {
  createMoodEntry,
  getMoodEntries,
  getMoodAnalytics,
  getMoodPatterns,
  getMoodStreaks,
  updateMoodEntry,
  deleteMoodEntry,
  uploadVoiceRecording,
  uploadPhoto,
  getMoodInsights,
  acknowledgeAlert,
  getMoodDashboardData,
  getMoodDashboardUnified,
  getRecentMood
} = require('../controllers/moodController');

// All routes are protected
router.use(protect);

// Mood entry routes (Your specified API structure)
router.post('/', validateMoodEntry, createMoodEntry); // /api/moods - POST
router.get('/', getMoodEntries); // /api/moods - GET
router.get('/recent', getRecentMood); // /api/moods/recent - GET
router.get('/analytics', getMoodAnalytics); // /api/moods/analytics - GET
router.get('/insights', getMoodInsights); // /api/moods/insights - GET
router.put('/entry/:id', validateMoodEntry, updateMoodEntry);
router.delete('/entry/:id', deleteMoodEntry);

// Legacy routes for backward compatibility
router.post('/entry', validateMoodEntry, createMoodEntry);
router.get('/entries', getMoodEntries);

// Analytics routes
router.get('/dashboard', getMoodDashboardData);
router.get('/dashboard-unified', getMoodDashboardUnified);
router.get('/patterns', getMoodPatterns);
router.get('/streaks', getMoodStreaks);

// File upload routes
router.post('/upload/voice', uploadVoiceRecording);
router.post('/upload/photo', uploadPhoto);

// Alert routes
router.put('/alert/:id/acknowledge', acknowledgeAlert);

module.exports = router; 