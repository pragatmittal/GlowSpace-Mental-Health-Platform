const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getDashboardData,
  getUserProgress,
  getEmotionTrends,
  getActivitySummary,
  getGoalProgress
} = require('../controllers/dashboardController');

// @route   GET /api/dashboard/data
// @desc    Get comprehensive dashboard data
// @access  Private
router.get('/data', protect, getDashboardData);

// @route   GET /api/dashboard/progress
// @desc    Get user progress metrics
// @access  Private
router.get('/progress', protect, getUserProgress);

// @route   GET /api/dashboard/emotions/trends
// @desc    Get emotion trends over time
// @access  Private
router.get('/emotions/trends', protect, getEmotionTrends);

// @route   GET /api/dashboard/activity/summary
// @desc    Get activity summary
// @access  Private
router.get('/activity/summary', protect, getActivitySummary);

// @route   GET /api/dashboard/goals/progress
// @desc    Get goal progress
// @access  Private
router.get('/goals/progress', protect, getGoalProgress);

module.exports = router;
