const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { validateGoal } = require('../middlewares/validators');
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  updateGoalProgress,
  resetGoalProgress,
  deleteGoal,
  getGoalsSummary,
  getExpiredGoals
} = require('../controllers/goalController');

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/goals
router.post('/', validateGoal, createGoal);

// @route   GET /api/goals
router.get('/', getGoals);

// @route   GET /api/goals/summary
router.get('/summary', getGoalsSummary);

// @route   GET /api/goals/expired
router.get('/expired', getExpiredGoals);

// @route   GET /api/goals/:id
router.get('/:id', getGoal);

// @route   PUT /api/goals/:id
router.put('/:id', validateGoal, updateGoal);

// @route   PUT /api/goals/:id/progress
router.put('/:id/progress', updateGoalProgress);

// @route   PUT /api/goals/:id/reset
router.put('/:id/reset', resetGoalProgress);

// @route   DELETE /api/goals/:id
router.delete('/:id', deleteGoal);

module.exports = router; 