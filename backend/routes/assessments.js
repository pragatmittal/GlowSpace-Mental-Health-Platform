const express = require('express');
const router = express.Router();

// Import controllers
const {
  createAssessment,
  getUserAssessments,
  getAssessment,
  submitAssessment,
  getAssessmentAnalytics,
  getAssessmentTemplates,
  deleteAssessment
} = require('../controllers/assessmentController');

// Import middleware
const { protect } = require('../middlewares/auth');
const { validateAssessment } = require('../middlewares/validators');

// Protect all routes
router.use(protect);

// Assessment templates (public for authenticated users)
router.get('/templates', getAssessmentTemplates);

// Assessment analytics
router.get('/analytics', getAssessmentAnalytics);

// Assessment CRUD operations
router.post('/', validateAssessment, createAssessment);
router.get('/', getUserAssessments);
router.get('/:id', getAssessment);
router.put('/:id/submit', submitAssessment);
router.delete('/:id', deleteAssessment);

module.exports = router;
