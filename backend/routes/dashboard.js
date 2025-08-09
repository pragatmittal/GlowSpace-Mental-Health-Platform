const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getDashboardData
} = require('../controllers/dashboardController');

// @route   GET /api/dashboard/data
// @desc    Get comprehensive dashboard data
// @access  Private
router.get('/data', protect, getDashboardData);

module.exports = router;
