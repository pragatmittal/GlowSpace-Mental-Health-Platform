// TEMPORARILY DISABLED - ASSESSMENT FUNCTIONALITY COMING SOON
// This entire controller is commented out for the "Coming Soon" feature
// All assessment functionality will be restored when the feature is ready

/*
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Assessment templates with questions and scoring
const assessmentTemplates = {
  depression: {
    name: 'Depression Assessment (PHQ-9)',
    description: 'Patient Health Questionnaire for depression screening',
    timeEstimate: '3-5 minutes',
    questions: [
      {
        id: 'phq1',
        question: 'Little interest or pleasure in doing things',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq2',
        question: 'Feeling down, depressed, or hopeless',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq3',
        question: 'Trouble falling or staying asleep, or sleeping too much',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq4',
        question: 'Feeling tired or having little energy',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq5',
        question: 'Poor appetite or overeating',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq6',
        question: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq7',
        question: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq8',
        question: 'Moving or speaking so slowly that other people could have noticed, or being so fidgety or restless that you have been moving around a lot more than usual',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq9',
        question: 'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      }
    ],
    scoring: {
      ranges: [
        { min: 0, max: 4, level: 'minimal', color: '#22C55E', description: 'Minimal depression' },
        { min: 5, max: 9, level: 'mild', color: '#EAB308', description: 'Mild depression' },
        { min: 10, max: 14, level: 'moderate', color: '#F97316', description: 'Moderate depression' },
        { min: 15, max: 19, level: 'moderately_severe', color: '#EF4444', description: 'Moderately severe depression' },
        { min: 20, max: 27, level: 'severe', color: '#DC2626', description: 'Severe depression' }
      ]
    }
  },

  anxiety: {
    name: 'Anxiety Assessment (GAD-7)',
    description: 'Generalized Anxiety Disorder 7-item scale',
    timeEstimate: '2-4 minutes',
    questions: [
      {
        id: 'gad1',
        question: 'Feeling nervous, anxious, or on edge',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'gad2',
        question: 'Not being able to stop or control worrying',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'gad3',
        question: 'Worrying too much about different things',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'gad4',
        question: 'Trouble relaxing',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'gad5',
        question: 'Being so restless that it is hard to sit still',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'gad6',
        question: 'Becoming easily annoyed or irritable',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'gad7',
        question: 'Feeling afraid, as if something awful might happen',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      }
    ],
    scoring: {
      ranges: [
        { min: 0, max: 4, level: 'minimal', color: '#22C55E', description: 'Minimal anxiety' },
        { min: 5, max: 9, level: 'mild', color: '#EAB308', description: 'Mild anxiety' },
        { min: 10, max: 14, level: 'moderate', color: '#F97316', description: 'Moderate anxiety' },
        { min: 15, max: 21, level: 'severe', color: '#DC2626', description: 'Severe anxiety' }
      ]
    }
  }
};

// Get available assessment templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = Object.keys(assessmentTemplates).map(key => ({
      type: key,
      name: assessmentTemplates[key].name,
      description: assessmentTemplates[key].description,
      timeEstimate: assessmentTemplates[key].timeEstimate,
      questionCount: assessmentTemplates[key].questions.length
    }));

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment templates',
      error: error.message
    });
  }
};

// Get specific assessment template with questions
exports.getTemplate = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!assessmentTemplates[type]) {
      return res.status(404).json({
        success: false,
        message: 'Assessment template not found'
      });
    }

    res.json({
      success: true,
      data: assessmentTemplates[type]
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment template',
      error: error.message
    });
  }
};

// Submit assessment responses
exports.submitAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { type, responses } = req.body;
    const userId = req.user.id;

    // Validate assessment type
    if (!assessmentTemplates[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment type'
      });
    }

    const template = assessmentTemplates[type];

    // Calculate score and interpretation
    const scoringCalc = calculateScore(type, responses || {}, template);
    const recommendations = generateRecommendations(type, scoringCalc);

    // Map flat responses into structured responses.ratings expected by schema
    const ratings = template.questions
      .filter(q => q.type === 'scale')
      .map(q => {
        const val = responses ? responses[q.id] : undefined;
        if (val === undefined || val === null || val === '') return null;
        return {
          questionId: q.id,
          rating: Number(val),
          scale: {
            min: q.scale?.min ?? 0,
            max: q.scale?.max ?? 3,
            labels: {
              low: Array.isArray(q.scale?.labels) ? q.scale.labels[0] : 'Low',
              high: Array.isArray(q.scale?.labels) ? q.scale.labels[q.scale.labels.length - 1] : 'High'
            }
          }
        };
      })
      .filter(Boolean);

    // Create assessment record matching schema
    const assessment = new Assessment({
      userId,
      type,
      title: template.name,
      description: template.description,
      // Save questions optionally for traceability (no answers stored here)
      // questions: template.questions,
      responses: {
        ratings
      },
      scoring: {
        totalScore: scoringCalc.totalScore,
        recommendations // riskLevel will be computed in pre-save based on responses
      },
      status: 'completed',
      completedAt: new Date()
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      data: {
        _id: assessment._id, // for frontend navigation contract
        assessmentId: assessment._id, // backward compatible
        type,
        title: assessment.title,
        description: assessment.description,
        score: {
          total: scoringCalc.totalScore,
          max: scoringCalc.maxScore,
          interpretation: scoringCalc.interpretation,
          level: scoringCalc.level,
          color: scoringCalc.color
        },
        recommendations,
        riskLevel: assessment.scoring?.riskLevel || 'low',
        completedAt: assessment.completedAt
      }
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
      error: isDev ? (error?.errors || error?.message || error) : undefined
    });
  }
};

// Get assessment history for a user
exports.getHistory = async (req, res) => {
  try {
    const { type, timeRange } = req.query;
    const userId = req.user.id;

    // Build query
    let query = { userId };
    
    // Filter by assessment type if specified
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by time range
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '1month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case '3months':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case '6months':
          startDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case '1year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Get assessments
    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate chart data and insights
    const chartData = calculateHistoryInsights(assessments);

    res.json({
      success: true,
      data: {
        history: assessments,
        chartData
      }
    });

  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment history',
      error: error.message
    });
  }
};

// Helper function to calculate assessment score
const calculateScore = (type, responses, template) => {
  let totalScore = 0;
  const maxScore = template.questions.reduce((sum, q) => sum + q.scale.max, 0);

  // Calculate total score based on responses
  template.questions.forEach(question => {
    const response = responses[question.id];
    if (response !== undefined && response !== null) {
      totalScore += parseInt(response);
    }
  });

  // Find interpretation based on score ranges
  const range = template.scoring.ranges.find(r => 
    totalScore >= r.min && totalScore <= r.max
  );

  return {
    totalScore,
    maxScore,
    interpretation: range ? range.description : 'Unable to determine',
    level: range ? range.level : 'unknown',
    color: range ? range.color : '#64748B'
  };
};

// Generate personalized recommendations
const generateRecommendations = (type, scoring) => {
  const recommendations = [];
  
  if (type === 'depression') {
    if (scoring.totalScore >= 15) {
      recommendations.push('Consider speaking with a mental health professional');
      recommendations.push('Establish a daily routine with regular sleep and meal times');
      recommendations.push('Engage in at least 30 minutes of physical activity daily');
      recommendations.push('Practice mindfulness or meditation for 10-15 minutes daily');
      recommendations.push('Connect with supportive friends or family members');
    } else if (scoring.totalScore >= 10) {
      recommendations.push('Maintain regular physical exercise and outdoor activities');
      recommendations.push('Practice stress-reduction techniques like deep breathing');
      recommendations.push('Keep a mood journal to identify patterns');
      recommendations.push('Ensure adequate sleep (7-9 hours per night)');
    } else if (scoring.totalScore >= 5) {
      recommendations.push('Continue healthy lifestyle habits');
      recommendations.push('Consider preventive mental wellness activities');
      recommendations.push('Stay connected with your social support network');
    } else {
      recommendations.push('Maintain your current positive mental health practices');
      recommendations.push('Consider helping others as a way to maintain wellbeing');
    }
  } else if (type === 'anxiety') {
    if (scoring.totalScore >= 15) {
      recommendations.push('Seek professional help from a therapist or counselor');
      recommendations.push('Practice deep breathing exercises throughout the day');
      recommendations.push('Limit caffeine and alcohol intake');
      recommendations.push('Try progressive muscle relaxation techniques');
      recommendations.push('Consider joining a support group');
    } else if (scoring.totalScore >= 10) {
      recommendations.push('Practice regular relaxation techniques');
      recommendations.push('Maintain a consistent sleep schedule');
      recommendations.push('Limit exposure to stressful news or social media');
      recommendations.push('Exercise regularly to reduce anxiety symptoms');
    } else if (scoring.totalScore >= 5) {
      recommendations.push('Continue stress management practices');
      recommendations.push('Practice mindfulness during daily activities');
      recommendations.push('Maintain healthy boundaries in relationships');
    } else {
      recommendations.push('Keep up your excellent stress management');
      recommendations.push('Share your coping strategies with others');
    }
  }

  return recommendations;
};

// Calculate insights from assessment history
const calculateHistoryInsights = (assessments) => {
  if (assessments.length === 0) {
    return {
      totalAssessments: 0,
      mostRecent: null,
      averageGap: 0,
      mostCommonType: null
    };
  }

  const totalAssessments = assessments.length;
  const mostRecent = assessments[0];

  // Calculate average gap between assessments
  let totalGap = 0;
  for (let i = 1; i < assessments.length; i++) {
    const gap = new Date(assessments[i-1].createdAt) - new Date(assessments[i].createdAt);
    totalGap += gap;
  }
  const averageGap = assessments.length > 1 ? 
    Math.round(totalGap / (assessments.length - 1) / (1000 * 60 * 60 * 24)) : 0;

  // Find most common assessment type
  const typeCounts = {};
  assessments.forEach(assessment => {
    typeCounts[assessment.type] = (typeCounts[assessment.type] || 0) + 1;
  });
  
  const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
    typeCounts[a] > typeCounts[b] ? a : b
  );

  return {
    totalAssessments,
    mostRecent,
    averageGap,
    mostCommonType
  };
};
*/

// Placeholder exports for "Coming Soon" functionality
module.exports = {
  getTemplates: (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Assessment templates coming soon! We\'re building something amazing.',
      comingSoon: true
    });
  },
  getTemplate: (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Assessment templates coming soon! We\'re building something amazing.',
      comingSoon: true
    });
  },
  submitAssessment: (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Assessment submission coming soon! We\'re building something amazing.',
      comingSoon: true
    });
  },
  getHistory: (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Assessment history coming soon! We\'re building something amazing.',
      comingSoon: true
    });
  }
};