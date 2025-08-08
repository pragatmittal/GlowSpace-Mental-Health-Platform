const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Register validation
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Reset password validation
const validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Profile update validation
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('profile.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender selection'),
  
  body('profile.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Invalid theme selection'),
  
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code'),
  
  handleValidationErrors
];

// Google auth validation
const validateGoogleAuth = [
  body('tokenId')
    .notEmpty()
    .withMessage('Google token is required'),
  
  handleValidationErrors
];

// Assessment validation
const validateAssessment = [
  body('type')
    .isIn(['trauma', 'medication', 'voice', 'mood'])
    .withMessage('Invalid assessment type'),
  
  body('data')
    .notEmpty()
    .withMessage('Assessment data is required'),
  
  handleValidationErrors
];

// Enhanced mood entry validation
const validateMoodEntry = [
  body('mood')
    .isIn(['very_sad', 'sad', 'neutral', 'happy', 'very_happy'])
    .withMessage('Invalid mood selection'),
  
  body('intensity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Intensity must be between 1 and 10'),
  
  body('moodWheel')
    .optional()
    .isObject()
    .withMessage('Mood wheel data must be an object'),
  
  body('moodWheel.x')
    .optional()
    .isFloat({ min: -1, max: 1 })
    .withMessage('Mood wheel X coordinate must be between -1 and 1'),
  
  body('moodWheel.y')
    .optional()
    .isFloat({ min: -1, max: 1 })
    .withMessage('Mood wheel Y coordinate must be between -1 and 1'),
  
  body('timeOfDay')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Invalid time of day'),
  
  body('activity')
    .optional()
    .isIn(['work', 'study', 'exercise', 'social', 'relaxation', 'creative', 'outdoor', 'indoor', 'travel', 'family', 'friends', 'alone', 'therapy', 'other'])
    .withMessage('Invalid activity'),
  
  body('socialContext')
    .optional()
    .isIn(['alone', 'with_friends', 'with_family', 'at_work', 'in_public', 'at_home', 'online', 'offline', 'mixed'])
    .withMessage('Invalid social context'),
  
  body('entryMethod')
    .optional()
    .isIn(['quick_button', 'mood_wheel', 'voice', 'photo', 'manual'])
    .withMessage('Invalid entry method'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  handleValidationErrors
];

// Counseling appointment validation
const validateAppointment = [
  body('doctorId')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  
  body('reason')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Reason must be less than 1000 characters'),
  
  handleValidationErrors
];

// Chat message validation
const validateChatMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  
  body('roomId')
    .isLength({ min: 1, max: 50 })
    .withMessage('Room ID must be between 1 and 50 characters'),
  
  body('receiverId')
    .optional()
    .isMongoId()
    .withMessage('Receiver ID must be a valid MongoDB ID'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'audio', 'emoji', 'system'])
    .withMessage('Invalid message type'),
  
  handleValidationErrors
];

// Challenge validation
const validateChallenge = [
  body('type')
    .isIn(['7-day', '21-day', '30-day'])
    .withMessage('Invalid challenge type'),
  
  handleValidationErrors
];

// Generic ID validation
const validateMongoId = (field = 'id') => [
  body(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
  
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};

// Emotion analysis validation
const validateEmotionAnalysis = [
  body('emotions')
    .isObject()
    .withMessage('Emotions must be an object')
    .custom((value) => {
      const requiredEmotions = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
      const emotionKeys = Object.keys(value);
      
      // Check if all required emotions are present
      for (const emotion of requiredEmotions) {
        if (!emotionKeys.includes(emotion)) {
          throw new Error(`Missing emotion: ${emotion}`);
        }
        
        const emotionValue = value[emotion];
        if (typeof emotionValue !== 'number' || emotionValue < 0 || emotionValue > 100) {
          throw new Error(`Invalid value for ${emotion}: must be a number between 0 and 100`);
        }
      }
      
      return true;
    }),
  
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string'),
  
  body('analysisMetadata')
    .optional()
    .isObject()
    .withMessage('Analysis metadata must be an object'),
  
  body('analysisMetadata.duration')
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number'),
  
  body('analysisMetadata.framesAnalyzed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Frames analyzed must be a non-negative integer'),
  
  body('analysisMetadata.detectionMethod')
    .optional()
    .isIn(['realtime', 'image', 'video'])
    .withMessage('Invalid detection method'),
  
  body('contextualData')
    .optional()
    .isObject()
    .withMessage('Contextual data must be an object'),
  
  body('contextualData.timeOfDay')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Invalid time of day'),
  
  body('contextualData.location')
    .optional()
    .isIn(['home', 'work', 'school', 'public', 'other'])
    .withMessage('Invalid location'),
  
  body('contextualData.activity')
    .optional()
    .isIn(['working', 'studying', 'exercising', 'socializing', 'relaxing', 'other'])
    .withMessage('Invalid activity'),
  
  body('contextualData.notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  
  handleValidationErrors
];

// Community validation
const validateCommunity = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Community name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Community name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('category')
    .optional()
    .isIn(['general', 'anxiety', 'depression', 'stress', 'relationships', 'self-care', 'therapy', 'meditation', 'fitness', 'nutrition'])
    .withMessage('Invalid category'),
  
  body('type')
    .optional()
    .isIn(['public'])
    .withMessage('Only public communities are supported'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  handleValidationErrors
];

// Community message validation
const validateCommunityMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'audio', 'emoji', 'system', 'announcement', 'poll'])
    .withMessage('Invalid message type'),
  
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply message ID'),
  
  body('poll')
    .optional()
    .isObject()
    .withMessage('Poll must be an object'),
  
  body('poll.question')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Poll question must be between 1 and 200 characters'),
  
  body('poll.options')
    .optional()
    .isArray({ min: 2, max: 10 })
    .withMessage('Poll must have between 2 and 10 options'),
  
  body('poll.options.*.text')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Poll option text must be between 1 and 100 characters'),
  
  body('poll.expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date'),
  
  body('poll.allowMultipleVotes')
    .optional()
    .isBoolean()
    .withMessage('Allow multiple votes must be a boolean'),
  
  handleValidationErrors
];

// Reaction validation
const validateReaction = [
  body('reaction')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Reaction must be between 1 and 10 characters'),
  
  handleValidationErrors
];

// Report validation
const validateReport = [
  body('reason')
    .isIn(['spam', 'inappropriate', 'harassment', 'misinformation', 'other'])
    .withMessage('Invalid report reason'),
  
  body('description')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  handleValidationErrors
];

// Moderation validation
const validateModeration = [
  body('action')
    .isIn(['warn', 'hide', 'delete', 'ban'])
    .withMessage('Invalid moderation action'),
  
  body('reason')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters'),
  
  handleValidationErrors
];

// Custom validation for complex objects
const validateComplexObject = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    const validateObject = (obj, schemaObj, path = '') => {
      for (const key in schemaObj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        const rules = schemaObj[key];

        if (rules.required && (value === undefined || value === null)) {
          errors.push(`${currentPath} is required`);
          continue;
        }

        if (value !== undefined && value !== null) {
          if (rules.type && typeof value !== rules.type) {
            errors.push(`${currentPath} must be of type ${rules.type}`);
          }

          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${currentPath} must be at least ${rules.minLength} characters long`);
          }

          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${currentPath} must be less than ${rules.maxLength} characters long`);
          }

          if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${currentPath} must be one of: ${rules.enum.join(', ')}`);
          }

          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${currentPath} format is invalid`);
          }

          if (rules.custom && !rules.custom(value)) {
            errors.push(`${currentPath} failed custom validation`);
          }

          if (rules.nested && typeof value === 'object') {
            validateObject(value, rules.nested, currentPath);
          }
        }
      }
    };

    validateObject(req.body, schema);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    next();
  };
};

// Goal validation
const validateGoal = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be between 1 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description is required and must be between 1 and 500 characters'),
  
  body('category')
    .isIn(['mindfulness', 'physical', 'emotional', 'social', 'productivity', 'learning', 'other'])
    .withMessage('Invalid category'),
  
  body('targetValue')
    .isInt({ min: 1 })
    .withMessage('Target value must be a positive integer'),
  
  body('unit')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit is required and must be between 1 and 20 characters'),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value) => {
      const endDate = new Date(value);
      const now = new Date();
      if (endDate <= now) {
        throw new Error('End date must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused', 'cancelled'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

// Goal progress validation
const validateGoalProgress = [
  body('increment')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Increment must be a positive integer'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateGoogleAuth,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateUpdateProfile,
  validateMoodEntry,
  validateEmotionAnalysis,
  validateAssessment,
  validateAppointment,
  validateCommunity,
  validateCommunityMessage,
  validateReaction,
  validateReport,
  validateModeration,
  validateGoal,
  validateGoalProgress,
  validateChatMessage
};
