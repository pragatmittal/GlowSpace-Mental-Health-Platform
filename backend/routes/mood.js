const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
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
  acknowledgeAlert
} = require('../controllers/moodController');

// All routes are protected
router.use(auth);

// Mood entry routes
router.post('/entry', validateMoodEntry, createMoodEntry);
router.get('/entries', getMoodEntries);
router.put('/entry/:id', validateMoodEntry, updateMoodEntry);
router.delete('/entry/:id', deleteMoodEntry);

// Analytics routes
router.get('/analytics', getMoodAnalytics);
router.get('/patterns', getMoodPatterns);
router.get('/streaks', getMoodStreaks);
router.get('/insights', getMoodInsights);

// File upload routes
router.post('/upload/voice', uploadVoiceRecording);
router.post('/upload/photo', uploadPhoto);

// Alert routes
router.put('/alert/:id/acknowledge', acknowledgeAlert);

module.exports = router; 