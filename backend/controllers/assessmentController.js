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
  },

  sleep: {
    name: 'Sleep Quality Assessment',
    description: 'Evaluate your sleep patterns and quality',
    timeEstimate: '3-4 minutes',
    questions: [
      {
        id: 'sleep1',
        question: 'How many hours of actual sleep do you get at night?',
        type: 'multiple_choice',
        options: ['Less than 5 hours', '5-6 hours', '6-7 hours', '7-8 hours', 'More than 8 hours']
      },
      {
        id: 'sleep2',
        question: 'How often have you had trouble sleeping because you cannot get to sleep within 30 minutes?',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not during the past month', 'Less than once a week', 'Once or twice a week', 'Three or more times a week'] }
      },
      {
        id: 'sleep3',
        question: 'How often have you had trouble sleeping because you wake up in the middle of the night or early morning?',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not during the past month', 'Less than once a week', 'Once or twice a week', 'Three or more times a week'] }
      },
      {
        id: 'sleep4',
        question: 'During the past month, how would you rate your sleep quality overall?',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Very good', 'Fairly good', 'Fairly bad', 'Very bad'] }
      },
      {
        id: 'sleep5',
        question: 'How often during the past month have you had trouble staying awake while driving, eating meals, or engaging in social activity?',
        type: 'scale',
        scale: { min: 0, max: 3, labels: ['Not during the past month', 'Less than once a week', 'Once or twice a week', 'Three or more times a week'] }
      }
    ],
    scoring: {
      ranges: [
        { min: 0, max: 5, level: 'excellent', color: '#22C55E', description: 'Excellent sleep quality' },
        { min: 6, max: 8, level: 'good', color: '#84CC16', description: 'Good sleep quality' },
        { min: 9, max: 11, level: 'fair', color: '#EAB308', description: 'Fair sleep quality' },
        { min: 12, max: 15, level: 'poor', color: '#DC2626', description: 'Poor sleep quality' }
      ]
    }
  },

  stress: {
    name: 'Stress Level Assessment',
    description: 'Evaluate your stress levels and coping abilities',
    timeEstimate: '3-5 minutes',
    questions: [
      {
        id: 'stress1',
        question: 'How often have you been upset because of something that happened unexpectedly?',
        type: 'scale',
        scale: { min: 0, max: 4, labels: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] }
      },
      {
        id: 'stress2',
        question: 'How often have you felt that you were unable to control the important things in your life?',
        type: 'scale',
        scale: { min: 0, max: 4, labels: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] }
      },
      {
        id: 'stress3',
        question: 'How often have you felt nervous and stressed?',
        type: 'scale',
        scale: { min: 0, max: 4, labels: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] }
      },
      {
        id: 'stress4',
        question: 'How often have you felt confident about your ability to handle your personal problems?',
        type: 'scale',
        scale: { min: 0, max: 4, labels: ['Very often', 'Fairly often', 'Sometimes', 'Almost never', 'Never'] }
      },
      {
        id: 'stress5',
        question: 'How often have you felt that things were going your way?',
        type: 'scale',
        scale: { min: 0, max: 4, labels: ['Very often', 'Fairly often', 'Sometimes', 'Almost never', 'Never'] }
      },
      {
        id: 'stress6',
        question: 'How often have you found that you could not cope with all the things that you had to do?',
        type: 'scale',
        scale: { min: 0, max: 4, labels: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] }
      }
    ],
    scoring: {
      ranges: [
        { min: 0, max: 8, level: 'low', color: '#22C55E', description: 'Low stress levels' },
        { min: 9, max: 14, level: 'moderate', color: '#EAB308', description: 'Moderate stress levels' },
        { min: 15, max: 20, level: 'high', color: '#F97316', description: 'High stress levels' },
        { min: 21, max: 24, level: 'very_high', color: '#DC2626', description: 'Very high stress levels' }
      ]
    }
  }
};

// Generate recommendations based on assessment results
const generateRecommendations = (assessmentType, score, level) => {
  const recommendations = {
    depression: {
      minimal: [
        'Keep up your healthy habits!',
        'Continue regular exercise and social activities',
        'Practice gratitude and mindfulness',
        'Maintain a consistent sleep schedule'
      ],
      mild: [
        'Consider talking to a counselor or therapist',
        'Try regular exercise and outdoor activities',
        'Practice relaxation techniques like meditation',
        'Connect with friends and family for support'
      ],
      moderate: [
        'We recommend speaking with a mental health professional',
        'Consider therapy or counseling sessions',
        'Establish a daily routine with self-care activities',
        'Reach out to your support network'
      ],
      moderately_severe: [
        'Professional help is strongly recommended',
        'Contact a mental health provider soon',
        'Consider medication evaluation if appropriate',
        'Ensure you have daily support from friends or family'
      ],
      severe: [
        'Immediate professional help is recommended',
        'Contact a mental health crisis line if needed',
        'Schedule an appointment with a psychiatrist or psychologist',
        'Ensure you have someone to talk to daily'
      ]
    },
    anxiety: {
      minimal: [
        'Great job managing your anxiety!',
        'Continue with stress-reduction techniques',
        'Maintain regular exercise and healthy habits',
        'Practice deep breathing when needed'
      ],
      mild: [
        'Try relaxation techniques like deep breathing',
        'Consider mindfulness or meditation practices',
        'Regular exercise can help reduce anxiety',
        'Talk to someone you trust about your concerns'
      ],
      moderate: [
        'Consider speaking with a counselor about anxiety management',
        'Practice daily relaxation techniques',
        'Try cognitive behavioral therapy techniques',
        'Limit caffeine and alcohol intake'
      ],
      severe: [
        'Professional help is recommended for anxiety management',
        'Consider therapy focused on anxiety disorders',
        'Speak with a healthcare provider about treatment options',
        'Practice grounding techniques during anxiety episodes'
      ]
    },
    sleep: {
      excellent: [
        'Excellent sleep quality! Keep it up!',
        'Maintain your current sleep routine',
        'Continue good sleep hygiene practices'
      ],
      good: [
        'Good sleep quality with room for improvement',
        'Try to maintain consistent sleep and wake times',
        'Create a relaxing bedtime routine'
      ],
      fair: [
        'Consider improving your sleep environment',
        'Limit screen time before bed',
        'Try relaxation techniques before sleep',
        'Avoid caffeine late in the day'
      ],
      poor: [
        'Poor sleep quality may affect your well-being',
        'Consider speaking with a healthcare provider',
        'Practice good sleep hygiene',
        'Address any underlying stress or anxiety'
      ]
    },
    stress: {
      low: [
        'You\'re managing stress well!',
        'Continue with your current coping strategies',
        'Maintain work-life balance'
      ],
      moderate: [
        'Try stress-reduction techniques like meditation',
        'Consider time management strategies',
        'Make time for relaxation and hobbies',
        'Talk to someone about your stressors'
      ],
      high: [
        'High stress levels may impact your health',
        'Consider speaking with a counselor',
        'Practice daily stress-reduction activities',
        'Evaluate your workload and commitments'
      ],
      very_high: [
        'Very high stress levels require attention',
        'Professional help is recommended',
        'Consider therapy for stress management',
        'Immediate stress-reduction strategies needed'
      ]
    }
  };

  return recommendations[assessmentType]?.[level] || ['Consider speaking with a mental health professional for personalized guidance.'];
};

// Calculate assessment score and level
const calculateScore = (assessmentType, responses) => {
  const template = assessmentTemplates[assessmentType];
  if (!template) return { totalScore: 0, level: 'unknown', interpretation: '', color: '#6B7280' };

  let totalScore = 0;
  
  // Calculate total score based on responses
  template.questions.forEach(question => {
    const response = responses[question.id];
    if (response !== undefined && response !== null) {
      if (question.type === 'scale') {
        totalScore += parseInt(response);
      } else if (question.type === 'multiple_choice') {
        // For multiple choice, assign scores based on option index
        const optionIndex = question.options.indexOf(response);
        if (optionIndex !== -1) {
          totalScore += optionIndex;
        }
      }
    }
  });

  // Find the appropriate level based on score
  const range = template.scoring.ranges.find(r => totalScore >= r.min && totalScore <= r.max);
  const level = range ? range.level : 'unknown';
  const interpretation = range ? range.description : 'Unable to determine level';
  const color = range ? range.color : '#6B7280';

  return { totalScore, level, interpretation, color };
};

// @desc    Get assessment templates
// @route   GET /api/assessments/templates
// @access  Private
exports.getAssessmentTemplates = async (req, res) => {
  try {
    const templates = Object.keys(assessmentTemplates).map(key => ({
      type: key,
      ...assessmentTemplates[key]
    }));

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get assessment templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assessment templates'
    });
  }
};

// @desc    Get specific assessment template questions
// @route   GET /api/assessments/templates/:type
// @access  Private
exports.getAssessmentQuestions = async (req, res) => {
  try {
    const { type } = req.params;
    const template = assessmentTemplates[type];
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Assessment type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        type,
        ...template
      }
    });
  } catch (error) {
    console.error('Get assessment questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assessment questions'
    });
  }
};

// @desc    Create a new assessment (start assessment)
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

    const { type } = req.body;
    const template = assessmentTemplates[type];
    
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment type'
      });
    }

    const assessment = new Assessment({
      userId: req.user.id,
      type,
      title: template.name,
      description: template.description,
      questions: template.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || [],
        required: true,
        answer: null
      })),
      status: 'draft'
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

// @desc    Submit completed assessment
// @route   PUT /api/assessments/:id/submit
// @access  Private
exports.submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { responses } = req.body;

    const assessment = await Assessment.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (assessment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Assessment already completed'
      });
    }

    // Calculate score and level
    const { totalScore, level, interpretation, color } = calculateScore(assessment.type, responses);

    // Generate recommendations
    const recommendations = generateRecommendations(assessment.type, totalScore, level);

    // Update assessment with responses and results
    assessment.responses = {
      ...assessment.responses,
      userResponses: responses
    };

    assessment.scoring = {
      totalScore,
      riskLevel: level,
      interpretation,
      color,
      recommendations,
      followUpRequired: ['moderately_severe', 'severe', 'very_high'].includes(level)
    };

    assessment.status = 'completed';
    assessment.completedAt = new Date();

    // Update user's mental health data
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        'mentalHealthData.lastAssessment': new Date(),
        [`mentalHealthData.lastAssessmentScores.${assessment.type}`]: {
          score: totalScore,
          level,
          completedAt: new Date()
        }
      }
    });

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment completed successfully',
      data: {
        assessment,
        results: {
          totalScore,
          level,
          interpretation,
          color,
          recommendations,
          needsFollowUp: assessment.scoring.followUpRequired
        }
      }
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting assessment'
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

// @desc    Get assessment analytics and trends
// @route   GET /api/assessments/analytics
// @access  Private
exports.getAssessmentAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get completed assessments within timeframe
    const assessments = await Assessment.find({
      userId,
      status: 'completed',
      completedAt: { $gte: startDate },
      isActive: true
    }).sort({ completedAt: -1 });

    // Group by assessment type
    const assessmentsByType = assessments.reduce((acc, assessment) => {
      if (!acc[assessment.type]) {
        acc[assessment.type] = [];
      }
      acc[assessment.type].push({
        score: assessment.scoring?.totalScore || 0,
        level: assessment.scoring?.riskLevel || 'unknown',
        completedAt: assessment.completedAt,
        interpretation: assessment.scoring?.interpretation || ''
      });
      return acc;
    }, {});

    // Calculate trends and insights
    const analytics = {
      summary: {
        totalAssessments: assessments.length,
        assessmentTypes: Object.keys(assessmentsByType).length,
        timeframe,
        dateRange: { start: startDate, end: new Date() }
      },
      byType: {},
      trends: {},
      insights: []
    };

    // Process each assessment type
    Object.keys(assessmentsByType).forEach(type => {
      const typeAssessments = assessmentsByType[type];
      const latest = typeAssessments[0];
      const previous = typeAssessments[1];

      analytics.byType[type] = {
        totalCount: typeAssessments.length,
        latestScore: latest?.score || 0,
        latestLevel: latest?.level || 'unknown',
        latestDate: latest?.completedAt,
        averageScore: typeAssessments.reduce((sum, a) => sum + a.score, 0) / typeAssessments.length,
        trend: previous ? (latest.score - previous.score) : 0,
        scores: typeAssessments.map(a => ({
          score: a.score,
          date: a.completedAt,
          level: a.level
        }))
      };

      // Trend analysis
      if (typeAssessments.length >= 2) {
        const trend = latest.score - previous.score;
        analytics.trends[type] = {
          direction: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
          change: Math.abs(trend),
          percentage: previous.score !== 0 ? ((trend / previous.score) * 100).toFixed(1) : 0
        };
      }
    });

    // Generate insights
    if (assessments.length > 0) {
      const recentAssessments = assessments.slice(0, 5);
      const improvingTypes = Object.keys(analytics.trends).filter(
        type => analytics.trends[type].direction === 'improving'
      );
      const decliningTypes = Object.keys(analytics.trends).filter(
        type => analytics.trends[type].direction === 'declining'
      );

      if (improvingTypes.length > 0) {
        analytics.insights.push({
          type: 'positive',
          message: `Your ${improvingTypes.join(' and ')} scores are improving! Keep up the great work.`,
          icon: '📈'
        });
      }

      if (decliningTypes.length > 0) {
        analytics.insights.push({
          type: 'attention',
          message: `Your ${decliningTypes.join(' and ')} scores need attention. Consider speaking with a counselor.`,
          icon: '⚠️'
        });
      }

      // Check for consistent high-risk scores
      const highRiskTypes = Object.keys(analytics.byType).filter(
        type => ['moderately_severe', 'severe', 'very_high'].includes(analytics.byType[type].latestLevel)
      );

      if (highRiskTypes.length > 0) {
        analytics.insights.push({
          type: 'urgent',
          message: 'Some of your recent assessment scores indicate you might benefit from professional support.',
          icon: '🚨'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get assessment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assessment analytics'
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
