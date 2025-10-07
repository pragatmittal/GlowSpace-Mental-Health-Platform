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

// Enable assessment functionality
// Assessment templates, submit, and history (temporarily without auth for testing)
router.get('/templates', getTemplates);
router.get('/templates/:type', getTemplate);
router.post('/submit', validateAssessment, submitAssessment);
router.get('/history', getHistory);

// Protected routes (for future use)
// router.use(protect);

module.exports = router;
