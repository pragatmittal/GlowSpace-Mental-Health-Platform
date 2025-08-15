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

// TEMPORARILY DISABLED - ASSESSMENT FUNCTIONALITY COMING SOON
// All assessment routes are commented out for "Coming Soon" feature

// Protect all routes
// router.use(protect);

// Assessment templates
// router.get('/templates', getTemplates);
// router.get('/templates/:type', getTemplate);

// Assessment operations
// router.post('/submit', validateAssessment, submitAssessment);
// router.get('/history', getHistory);

// Temporary route for coming soon
router.get('*', (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Assessment features are coming soon! We\'re building something amazing for you.',
    comingSoon: true
  });
});

module.exports = router;
