const express = require('express');
const router = express.Router();

// Import controllers
const {
  getTemplates,
  getTemplate,
  submitAssessment,
  getHistory
} = require('../controllers/assessmentController');

// Import middleware
const { protect } = require('../middlewares/auth');
const { validateAssessment } = require('../middlewares/validators');

// Protect all routes
router.use(protect);

// Assessment templates
router.get('/templates', getTemplates);
router.get('/templates/:type', getTemplate);

// Assessment operations
router.post('/submit', validateAssessment, submitAssessment);
router.get('/history', getHistory);

module.exports = router;
