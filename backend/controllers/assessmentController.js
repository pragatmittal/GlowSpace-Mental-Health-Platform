const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private
exports.createAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, title, description, questions } = req.body;

    const assessment = new Assessment({
      userId: req.user.id,
      type,
      title,
      description,
      questions: questions || []
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating assessment'
    });
  }
};

// @desc    Get user's assessments
// @route   GET /api/assessments
// @access  Private
exports.getUserAssessments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const query = { userId: req.user.id, isActive: true };
    if (type) query.type = type;
    if (status) query.status = status;

    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Assessment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        assessments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          hasNextPage: page < Math.ceil(totalCount / parseInt(limit)),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assessments'
    });
  }
};

// @desc    Get specific assessment
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assessment'
    });
  }
};

// @desc    Submit assessment responses
// @route   PUT /api/assessments/:id/submit
// @access  Private
exports.submitAssessment = async (req, res) => {
  try {
    const { responses } = req.body;
    
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Update responses
    assessment.responses = { ...assessment.responses, ...responses };
    assessment.status = 'completed';
    
    // Perform AI analysis for text responses
    if (responses.textResponses) {
      for (let textResponse of responses.textResponses) {
        // Simulate sentiment analysis (in production, use actual NLP service)
        const sentiment = await analyzeSentiment(textResponse.response);
        textResponse.sentiment = sentiment;
        textResponse.keywords = await extractKeywords(textResponse.response);
        textResponse.analysisMetadata = {
          wordCount: textResponse.response.split(' ').length,
          readingTime: Math.ceil(textResponse.response.split(' ').length / 200),
          complexity: calculateComplexity(textResponse.response)
        };
      }
    }

    // Calculate scoring
    const totalScore = calculateAssessmentScore(assessment);
    assessment.scoring.totalScore = totalScore;

    // Generate AI analysis
    assessment.analysis.aiAnalysis = await generateAIAnalysis(assessment);

    await assessment.save();

    // Update user's last assessment timestamp
    await User.findByIdAndUpdate(req.user.id, {
      'mentalHealthData.lastAssessment': new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting assessment'
    });
  }
};

// @desc    Get assessment analytics
// @route   GET /api/assessments/analytics
// @access  Private
exports.getAssessmentAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const analytics = await Assessment.getAssessmentAnalytics(req.user.id, parseInt(days));

    // Calculate additional metrics
    const totalAssessments = analytics.reduce((sum, item) => sum + item.count, 0);
    const averageScore = analytics.reduce((sum, item) => sum + (item.avgScore || 0), 0) / analytics.length;
    
    // Risk level distribution
    const riskDistribution = {};
    for (let item of analytics) {
      item.riskLevels.forEach(level => {
        riskDistribution[level] = (riskDistribution[level] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        analytics,
        summary: {
          totalAssessments,
          averageScore: Math.round(averageScore * 100) / 100,
          riskDistribution,
          period: `${days} days`
        }
      }
    });
  } catch (error) {
    console.error('Get assessment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving analytics'
    });
  }
};

// @desc    Get pre-built assessment templates
// @route   GET /api/assessments/templates
// @access  Private
exports.getAssessmentTemplates = async (req, res) => {
  try {
    const templates = [
      {
        type: 'anxiety',
        title: 'Anxiety Assessment',
        description: 'Evaluate your anxiety levels and identify potential triggers',
        questions: [
          {
            id: 'anxiety_1',
            question: 'How often do you feel nervous, anxious, or on edge?',
            type: 'multiple_choice',
            options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
            required: true
          },
          {
            id: 'anxiety_2',
            question: 'How often do you have trouble relaxing?',
            type: 'multiple_choice',
            options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
            required: true
          },
          {
            id: 'anxiety_3',
            question: 'Rate your overall anxiety level today (1-10)',
            type: 'scale',
            required: true
          },
          {
            id: 'anxiety_4',
            question: 'What situations or thoughts trigger your anxiety?',
            type: 'text',
            required: false
          }
        ]
      },
      {
        type: 'depression',
        title: 'Depression Screening',
        description: 'Assess your mood and identify signs of depression',
        questions: [
          {
            id: 'depression_1',
            question: 'How often do you feel down, depressed, or hopeless?',
            type: 'multiple_choice',
            options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
            required: true
          },
          {
            id: 'depression_2',
            question: 'How often do you have little interest or pleasure in doing things?',
            type: 'multiple_choice',
            options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
            required: true
          },
          {
            id: 'depression_3',
            question: 'Rate your energy level today (1-10)',
            type: 'scale',
            required: true
          },
          {
            id: 'depression_4',
            question: 'Describe your current mood and any specific concerns',
            type: 'text',
            required: false
          }
        ]
      },
      {
        type: 'stress',
        title: 'Stress Level Assessment',
        description: 'Measure your current stress levels and identify stressors',
        questions: [
          {
            id: 'stress_1',
            question: 'How stressed do you feel right now? (1-10)',
            type: 'scale',
            required: true
          },
          {
            id: 'stress_2',
            question: 'What are your main sources of stress?',
            type: 'multiple_choice',
            options: ['Work', 'Relationships', 'Health', 'Finances', 'Family', 'Other'],
            required: true
          },
          {
            id: 'stress_3',
            question: 'How well do you feel you cope with stress?',
            type: 'multiple_choice',
            options: ['Very well', 'Somewhat well', 'Not very well', 'Poorly'],
            required: true
          },
          {
            id: 'stress_4',
            question: 'Describe a recent stressful situation and how you handled it',
            type: 'text',
            required: false
          }
        ]
      },
      {
        type: 'trauma',
        title: 'Trauma Assessment',
        description: 'Confidential assessment to understand trauma impact',
        questions: [
          {
            id: 'trauma_1',
            question: 'Rate how much past experiences affect your daily life (1-10)',
            type: 'scale',
            required: true
          },
          {
            id: 'trauma_2',
            question: 'Do you experience flashbacks or intrusive thoughts?',
            type: 'boolean',
            required: true
          },
          {
            id: 'trauma_3',
            question: 'How would you describe your sleep quality?',
            type: 'multiple_choice',
            options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very poor'],
            required: true
          },
          {
            id: 'trauma_4',
            question: 'Please share anything you feel comfortable discussing about your experiences',
            type: 'text',
            required: false
          }
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving templates'
    });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Soft delete
    assessment.isActive = false;
    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting assessment'
    });
  }
};

// Helper functions

// Simulate sentiment analysis (replace with actual NLP service)
async function analyzeSentiment(text) {
  // Simple sentiment analysis simulation
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'positive', 'wonderful', 'amazing'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'negative', 'horrible', 'depressed'];
  
  const words = text.toLowerCase().split(' ');
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const totalEmotionalWords = positiveCount + negativeCount;
  if (totalEmotionalWords === 0) {
    return { score: 0, label: 'neutral', confidence: 0.5 };
  }
  
  const score = (positiveCount - negativeCount) / totalEmotionalWords;
  const label = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';
  const confidence = Math.abs(score);
  
  return { score, label, confidence };
}

// Extract keywords from text
async function extractKeywords(text) {
  // Simple keyword extraction (replace with actual NLP service)
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'as', 'are', 'was', 'will', 'be'];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !stopWords.includes(word));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Return top 5 keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

// Calculate text complexity
function calculateComplexity(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(' ').filter(w => w.trim().length > 0);
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Simple complexity score based on sentence length
  if (avgWordsPerSentence < 10) return 1; // Simple
  if (avgWordsPerSentence < 20) return 2; // Moderate
  return 3; // Complex
}

// Calculate assessment score
function calculateAssessmentScore(assessment) {
  let totalScore = 0;
  let maxScore = 0;
  
  // Score based on multiple choice answers
  if (assessment.responses.multipleChoice) {
    assessment.responses.multipleChoice.forEach(response => {
      const optionIndex = response.allOptions.indexOf(response.selectedOption);
      totalScore += optionIndex + 1;
      maxScore += response.allOptions.length;
    });
  }
  
  // Score based on ratings
  if (assessment.responses.ratings) {
    assessment.responses.ratings.forEach(rating => {
      totalScore += rating.rating;
      maxScore += rating.scale.max;
    });
  }
  
  // Convert to percentage
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 50;
}

// Generate AI analysis
async function generateAIAnalysis(assessment) {
  // Simulate AI analysis (replace with actual AI service)
  const insights = [];
  const patterns = [];
  const concerns = [];
  
  // Analyze based on assessment type
  if (assessment.type === 'anxiety') {
    insights.push('Anxiety levels indicate need for stress management techniques');
    patterns.push('Higher anxiety reported during certain times of day');
  } else if (assessment.type === 'depression') {
    insights.push('Mood patterns suggest benefit from regular activity scheduling');
    patterns.push('Energy levels correlate with social interaction frequency');
  }
  
  // Check for concerning patterns
  if (assessment.scoring.totalScore < 30) {
    concerns.push('Low overall score indicates need for professional support');
  }
  
  const summary = `Assessment completed for ${assessment.type}. Score: ${assessment.scoring.totalScore}/100. Recommendations available.`;
  
  return {
    summary,
    insights,
    patterns,
    concerns
  };
}
