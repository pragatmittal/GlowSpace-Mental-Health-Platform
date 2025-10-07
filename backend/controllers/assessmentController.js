// Comprehensive Mental Health Assessment Controller
// Supports two optional sections: Tell About Yourself and Scenario-Based Testing
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Comprehensive Mental Health Assessment Templates
const assessmentTemplates = {
  comprehensive: {
    name: 'Comprehensive Mental Health Assessment',
    description: 'A personalized assessment with two optional sections to understand your mental well-being',
    timeEstimate: '5-10 minutes',
    sections: {
      section1: {
        title: 'Tell About Yourself',
        description: 'Share basic information about your lifestyle and current state',
        questions: [
          {
            id: 'name',
            question: 'What should we call you? (Optional)',
            type: 'text',
            required: false,
            placeholder: 'Enter your name or preferred nickname'
          },
          {
            id: 'ageGroup',
            question: 'What is your age group?',
            type: 'multiple_choice',
            required: true,
            options: ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', 'Over 65']
          },
          {
            id: 'gender',
            question: 'How do you identify? (Optional)',
            type: 'multiple_choice',
            required: false,
            options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']
          },
          {
            id: 'occupation',
            question: 'What is your current occupation or main activity?',
            type: 'text',
            required: true,
            placeholder: 'e.g., Student, Software Engineer, Teacher, Retired, etc.'
          },
          {
            id: 'stressLevel',
            question: 'On a scale of 1-10, how would you rate your current stress level?',
            type: 'scale',
            required: true,
            scale: { 
              min: 1, 
              max: 10, 
              labels: ['Very Low', 'Low', 'Somewhat Low', 'Moderate', 'Somewhat High', 'High', 'Very High', 'Extremely High', 'Overwhelming', 'Unmanageable'] 
            }
          },
          {
            id: 'sleepQuality',
            question: 'How would you describe your recent sleep quality?',
            type: 'multiple_choice',
            required: true,
            options: ['Excellent - I sleep deeply and wake refreshed', 'Good - I usually sleep well', 'Average - My sleep is okay but could be better', 'Poor - I often have trouble sleeping', 'Very Poor - I rarely get good sleep']
          },
          {
            id: 'exerciseFrequency',
            question: 'How often do you engage in physical exercise or activity?',
            type: 'multiple_choice',
            required: true,
            options: ['Daily', '4-6 times per week', '2-3 times per week', 'Once a week', 'Rarely', 'Never']
          },
          {
            id: 'socialInteraction',
            question: 'How would you describe your current social interactions?',
            type: 'multiple_choice',
            required: true,
            options: ['Very active - I socialize frequently', 'Moderately active - I have regular social contact', 'Somewhat active - I socialize occasionally', 'Limited - I have minimal social contact', 'Isolated - I rarely interact with others']
          },
          {
            id: 'screenTime',
            question: 'How much time do you spend on screens daily (phones, computers, TV)?',
            type: 'multiple_choice',
            required: true,
            options: ['Less than 2 hours', '2-4 hours', '4-6 hours', '6-8 hours', 'More than 8 hours']
          },
          {
            id: 'pastExperiences',
            question: 'Have you experienced any significant life changes, challenges, or traumas recently? (Optional)',
            type: 'text',
            required: false,
            placeholder: 'Share only what you feel comfortable discussing...'
          }
        ]
      },
      section2: {
        title: 'Scenario-Based Testing',
        description: 'How would you respond in these everyday situations?',
        questions: [
          {
            id: 'scenario1',
            question: 'If you had an important exam or meeting tomorrow but couldn\'t sleep well, what would you do?',
            type: 'multiple_choice',
            required: true,
            options: [
              'Stay up all night studying/preparing to make up for lost sleep',
              'Try relaxation techniques and go to bed early, accepting whatever happens',
              'Cancel or reschedule the exam/meeting if possible',
              'Take caffeine or energy supplements to power through',
              'Worry about it all night and feel anxious'
            ],
            traits: ['perfectionist', 'adaptive', 'avoidant', 'anxious', 'anxious']
          },
          {
            id: 'scenario2',
            question: 'A close friend cancels on you at the last minute, how would you react?',
            type: 'multiple_choice',
            required: true,
            options: [
              'Feel disappointed but understand and make other plans',
              'Feel hurt and wonder if they\'re avoiding you',
              'Get angry and confront them about their unreliability',
              'Feel relieved and enjoy the unexpected free time',
              'Feel anxious about what might be wrong with them'
            ],
            traits: ['resilient', 'sensitive', 'confrontational', 'independent', 'anxious']
          },
          {
            id: 'scenario3',
            question: 'If your work is rejected, what\'s your first thought?',
            type: 'multiple_choice',
            required: true,
            options: [
              'This is a learning opportunity - what can I improve?',
              'I\'m not good enough and should give up',
              'They don\'t understand my vision or approach',
              'I need to work harder and try again immediately',
              'This confirms my worst fears about my abilities'
            ],
            traits: ['growth_minded', 'self_doubting', 'defensive', 'perfectionist', 'pessimistic']
          },
          {
            id: 'scenario4',
            question: 'You\'re running late for an important appointment. What do you do?',
            type: 'multiple_choice',
            required: true,
            options: [
              'Call ahead to let them know and stay calm',
              'Panic and rush, making mistakes along the way',
              'Cancel the appointment to avoid the embarrassment',
              'Blame external factors and get frustrated',
              'Feel overwhelmed and consider not going at all'
            ],
            traits: ['organized', 'anxious', 'avoidant', 'external_locus', 'overwhelmed']
          },
          {
            id: 'scenario5',
            question: 'Someone gives you constructive criticism. How do you typically respond?',
            type: 'multiple_choice',
            required: true,
            options: [
              'Listen carefully and ask for specific examples to improve',
              'Feel defensive but try to understand their perspective',
              'Get upset and question their motives',
              'Dismiss it as their personal opinion',
              'Feel hurt and take it personally'
            ],
            traits: ['open_minded', 'defensive', 'confrontational', 'dismissive', 'sensitive']
          }
        ]
      }
    }
  }
};

// Get available assessment templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = Object.keys(assessmentTemplates).map(key => {
      const template = assessmentTemplates[key];
      let questionCount = 0;
      
      // Calculate total questions across all sections
      if (template.sections) {
        Object.values(template.sections).forEach(section => {
          questionCount += section.questions.length;
        });
      } else if (template.questions) {
        questionCount = template.questions.length;
      }

      return {
        type: key,
        name: template.name,
        description: template.description,
        timeEstimate: template.timeEstimate,
        questionCount,
        hasSections: !!template.sections
      };
    });

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
    const { sections } = req.query; // Optional: specify which sections to return
    
    if (!assessmentTemplates[type]) {
      return res.status(404).json({
        success: false,
        message: 'Assessment template not found'
      });
    }

    const template = assessmentTemplates[type];
    let responseData = { ...template };

    // If sections parameter is provided, filter sections
    if (sections && template.sections) {
      const requestedSections = sections.split(',');
      const filteredSections = {};
      
      requestedSections.forEach(sectionKey => {
        if (template.sections[sectionKey]) {
          filteredSections[sectionKey] = template.sections[sectionKey];
        }
      });
      
      responseData.sections = filteredSections;
    }

    res.json({
      success: true,
      data: responseData
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

    const { type, responses, completedSections } = req.body;
    const mongoose = require('mongoose');
    
    // Use authenticated user ID if available, otherwise use a default user ID for non-authenticated users
    let userId = req.user?.id;
    if (!userId) {
      // For non-authenticated users, use a consistent default user ID
      // This allows them to see their assessment history
      userId = new mongoose.Types.ObjectId('000000000000000000000000');
    }

    // Validate assessment type
    if (!assessmentTemplates[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment type'
      });
    }

    const template = assessmentTemplates[type];

    // Process responses based on assessment type
    let processedResponses = {};
    let scoringResults = {};

    if (type === 'comprehensive') {
      // Handle comprehensive assessment with sections
      processedResponses = processComprehensiveResponses(responses, completedSections, template);
      scoringResults = calculateComprehensiveScore(responses, completedSections, template);
    } else {
      // Handle legacy single-section assessments
      const scoringCalc = calculateScore(type, responses || {}, template);
      scoringResults = {
        totalScore: scoringCalc.totalScore,
        maxScore: scoringCalc.maxScore,
        interpretation: scoringCalc.interpretation,
        level: scoringCalc.level,
        color: scoringCalc.color
      };
    }

    const recommendations = generateComprehensiveRecommendations(type, scoringResults, completedSections);

    // Create assessment record with comprehensive data
    const assessment = new Assessment({
      userId,
      type,
      title: template.name,
      description: template.description,
      responses: processedResponses,
      scoring: {
        totalScore: scoringResults.totalScore,
        maxScore: scoringResults.maxScore,
        recommendations,
        riskLevel: scoringResults.riskLevel || 'low',
        sectionScores: scoringResults.sectionScores || {},
        insights: scoringResults.insights || {},
        interpretation: scoringResults.interpretation,
        level: scoringResults.level,
        color: scoringResults.color
      },
      status: 'completed',
      completedAt: new Date(),
      metadata: {
        completedSections: completedSections || [],
        assessmentVersion: '2.0',
        // Store personal assessment details for history display
        personalDetails: type === 'comprehensive' && completedSections?.includes('section1') ? {
          stressLevel: responses.stressLevel,
          sleepQuality: responses.sleepQuality,
          exerciseFrequency: responses.exerciseFrequency,
          socialInteraction: responses.socialInteraction,
          screenTime: responses.screenTime,
          ageGroup: responses.ageGroup,
          gender: responses.gender,
          occupation: responses.occupation
        } : null
      }
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      data: {
        _id: assessment._id,
        assessmentId: assessment._id,
        type,
        title: assessment.title,
        description: assessment.description,
        score: {
          total: scoringResults.totalScore,
          max: scoringResults.maxScore,
          interpretation: scoringResults.interpretation,
          level: scoringResults.level,
          color: scoringResults.color
        },
        recommendations,
        riskLevel: assessment.scoring?.riskLevel || 'low',
        completedAt: assessment.completedAt,
        insights: scoringResults.insights || {},
        completedSections: completedSections || [],
        personalDetails: assessment.metadata?.personalDetails || null
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
    
    // Handle both authenticated and non-authenticated users
    const mongoose = require('mongoose');
    let userId = req.user?.id;
    if (!userId) {
      // For non-authenticated users, use the same default user ID as in submitAssessment
      userId = new mongoose.Types.ObjectId('000000000000000000000000');
    }

    // Build query
    let query = { userId, status: 'completed' };
    
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
        query.completedAt = { $gte: startDate };
      }
    }

    // Get assessments with comprehensive data
    const assessments = await Assessment.find(query)
      .sort({ completedAt: -1 })
      .limit(50)
      .select('type title description responses scoring completedAt metadata createdAt');

    // Transform assessments for frontend display
    const transformedHistory = assessments.map(assessment => ({
      _id: assessment._id,
      type: assessment.type,
      title: assessment.title,
      description: assessment.description,
      completedAt: assessment.completedAt,
      createdAt: assessment.createdAt,
      score: {
        total: assessment.scoring?.totalScore || 0,
        max: assessment.scoring?.maxScore || 100,
        interpretation: assessment.scoring?.interpretation || 'No interpretation available',
        level: assessment.scoring?.level || 'unknown',
        color: assessment.scoring?.color || '#64748B'
      },
      riskLevel: assessment.scoring?.riskLevel || 'low',
      recommendations: assessment.scoring?.recommendations || [],
      insights: assessment.scoring?.insights || {},
      sectionScores: assessment.scoring?.sectionScores || {},
      completedSections: assessment.metadata?.completedSections || [],
      personalDetails: assessment.metadata?.personalDetails || null,
      // Include raw responses for detailed view
      responses: assessment.responses
    }));

    // Calculate chart data and insights
    const chartData = calculateHistoryInsights(assessments);

    res.json({
      success: true,
      data: {
        history: transformedHistory,
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

// Process comprehensive assessment responses
const processComprehensiveResponses = (responses, completedSections, template) => {
  const processedResponses = {
    textResponses: [],
    ratings: [],
    multipleChoice: []
  };

  // Process each completed section
  completedSections.forEach(sectionKey => {
    const section = template.sections[sectionKey];
    if (!section) return;

    section.questions.forEach(question => {
      const response = responses[question.id];
      if (response === undefined || response === null || response === '') return;

      switch (question.type) {
        case 'text':
          processedResponses.textResponses.push({
            questionId: question.id,
            response: response,
            section: sectionKey
          });
          break;
        
        case 'scale':
          processedResponses.ratings.push({
            questionId: question.id,
            rating: Number(response),
            scale: {
              min: question.scale?.min ?? 1,
              max: question.scale?.max ?? 10,
              labels: {
                low: Array.isArray(question.scale?.labels) ? question.scale.labels[0] : 'Low',
                high: Array.isArray(question.scale?.labels) ? question.scale.labels[question.scale.labels.length - 1] : 'High'
              }
            },
            section: sectionKey
          });
          break;
        
        case 'multiple_choice':
          processedResponses.multipleChoice.push({
            questionId: question.id,
            selectedOption: response,
            allOptions: question.options,
            section: sectionKey
          });
          break;
      }
    });
  });

  return processedResponses;
};

// Calculate comprehensive assessment score
const calculateComprehensiveScore = (responses, completedSections, template) => {
  const sectionScores = {};
  const insights = {};
  let totalScore = 0;
  let maxScore = 0;

  // Process Section 1: Tell About Yourself
  if (completedSections.includes('section1')) {
    const section1Score = calculateSection1Score(responses, template.sections.section1);
    sectionScores.section1 = section1Score;
    insights.lifestyle = generateLifestyleInsights(section1Score, responses);
    totalScore += section1Score.score;
    maxScore += section1Score.maxScore;
  }

  // Process Section 2: Scenario-Based Testing
  if (completedSections.includes('section2')) {
    const section2Score = calculateSection2Score(responses, template.sections.section2);
    sectionScores.section2 = section2Score;
    insights.personality = generatePersonalityInsights(section2Score, responses);
    totalScore += section2Score.score;
    maxScore += section2Score.maxScore;
  }

  // Generate combined insights if both sections completed
  if (completedSections.length === 2) {
    insights.combined = generateCombinedInsights(sectionScores, insights);
  }

  // Determine overall risk level
  const riskLevel = determineRiskLevel(totalScore, maxScore, insights);

  return {
    totalScore,
    maxScore,
    sectionScores,
    insights,
    riskLevel,
    interpretation: generateOverallInterpretation(totalScore, maxScore, completedSections.length),
    level: getScoreLevel(totalScore, maxScore),
    color: getScoreColor(totalScore, maxScore)
  };
};

// Calculate Section 1 (Tell About Yourself) score
const calculateSection1Score = (responses, section) => {
  let score = 0;
  let maxScore = 0;
  const factors = {};

  section.questions.forEach(question => {
    const response = responses[question.id];
    if (response === undefined || response === null || response === '') return;

    switch (question.id) {
      case 'stressLevel':
        const stressScore = Number(response);
        factors.stress = stressScore;
        score += (11 - stressScore); // Invert so lower stress = higher score
        maxScore += 10;
        break;
      
      case 'sleepQuality':
        const sleepScores = {
          'Excellent - I sleep deeply and wake refreshed': 5,
          'Good - I usually sleep well': 4,
          'Average - My sleep is okay but could be better': 3,
          'Poor - I often have trouble sleeping': 2,
          'Very Poor - I rarely get good sleep': 1
        };
        factors.sleep = sleepScores[response] || 0;
        score += factors.sleep;
        maxScore += 5;
        break;
      
      case 'exerciseFrequency':
        const exerciseScores = {
          'Daily': 5,
          '4-6 times per week': 4,
          '2-3 times per week': 3,
          'Once a week': 2,
          'Rarely': 1,
          'Never': 0
        };
        factors.exercise = exerciseScores[response] || 0;
        score += factors.exercise;
        maxScore += 5;
        break;
      
      case 'socialInteraction':
        const socialScores = {
          'Very active - I socialize frequently': 5,
          'Moderately active - I have regular social contact': 4,
          'Somewhat active - I socialize occasionally': 3,
          'Limited - I have minimal social contact': 2,
          'Isolated - I rarely interact with others': 1
        };
        factors.social = socialScores[response] || 0;
        score += factors.social;
        maxScore += 5;
        break;
      
      case 'screenTime':
        const screenScores = {
          'Less than 2 hours': 5,
          '2-4 hours': 4,
          '4-6 hours': 3,
          '6-8 hours': 2,
          'More than 8 hours': 1
        };
        factors.screenTime = screenScores[response] || 0;
        score += factors.screenTime;
        maxScore += 5;
        break;
    }
  });

  return { score, maxScore, factors };
};

// Calculate Section 2 (Scenario-Based Testing) score
const calculateSection2Score = (responses, section) => {
  let score = 0;
  let maxScore = 0;
  const traitScores = {};

  section.questions.forEach(question => {
    const response = responses[question.id];
    if (response === undefined || response === null || response === '') return;

    const selectedIndex = question.options.indexOf(response);
    if (selectedIndex === -1) return;

    const trait = question.traits[selectedIndex];
    if (!trait) return;

    // Score based on positive vs negative traits
    const traitValue = getTraitValue(trait);
    traitScores[trait] = (traitScores[trait] || 0) + traitValue;
    
    score += traitValue;
    maxScore += 5; // Each question worth 5 points max
  });

  return { score, maxScore, traitScores };
};

// Get trait value for scoring
const getTraitValue = (trait) => {
  const positiveTraits = {
    'adaptive': 5, 'resilient': 5, 'growth_minded': 5, 'organized': 5, 'open_minded': 5,
    'independent': 4
  };
  
  const neutralTraits = {
    'perfectionist': 3, 'defensive': 2, 'sensitive': 2
  };
  
  const negativeTraits = {
    'anxious': 1, 'avoidant': 1, 'self_doubting': 1, 'confrontational': 1, 'dismissive': 1,
    'external_locus': 1, 'overwhelmed': 1, 'pessimistic': 1
  };

  return positiveTraits[trait] || neutralTraits[trait] || negativeTraits[trait] || 2;
};

// Generate lifestyle insights
const generateLifestyleInsights = (section1Score, responses) => {
  const insights = {
    strengths: [],
    concerns: [],
    recommendations: []
  };

  const { factors } = section1Score;

  // Analyze stress level
  if (factors.stress <= 3) {
    insights.strengths.push('You maintain low stress levels');
  } else if (factors.stress >= 8) {
    insights.concerns.push('High stress levels may be impacting your wellbeing');
    insights.recommendations.push('Consider stress management techniques like meditation or deep breathing');
  }

  // Analyze sleep quality
  if (factors.sleep >= 4) {
    insights.strengths.push('Good sleep habits support your mental health');
  } else if (factors.sleep <= 2) {
    insights.concerns.push('Poor sleep quality may be affecting your mental wellbeing');
    insights.recommendations.push('Establish a consistent bedtime routine and limit screen time before bed');
  }

  // Analyze exercise
  if (factors.exercise >= 4) {
    insights.strengths.push('Regular physical activity supports your mental health');
  } else if (factors.exercise <= 2) {
    insights.concerns.push('Limited physical activity may impact your mood and energy');
    insights.recommendations.push('Try to incorporate 30 minutes of physical activity most days');
  }

  // Analyze social interaction
  if (factors.social >= 4) {
    insights.strengths.push('Strong social connections support your wellbeing');
  } else if (factors.social <= 2) {
    insights.concerns.push('Limited social interaction may affect your mental health');
    insights.recommendations.push('Consider reaching out to friends or joining social activities');
  }

  return insights;
};

// Generate personality insights
const generatePersonalityInsights = (section2Score, responses) => {
  const insights = {
    strengths: [],
    concerns: [],
    recommendations: []
  };

  const { traitScores } = section2Score;

  // Analyze trait patterns
  Object.entries(traitScores).forEach(([trait, score]) => {
    if (score >= 3) {
      switch (trait) {
        case 'resilient':
          insights.strengths.push('You show resilience in challenging situations');
          break;
        case 'adaptive':
          insights.strengths.push('You adapt well to changing circumstances');
          break;
        case 'growth_minded':
          insights.strengths.push('You have a growth mindset and learn from feedback');
          break;
        case 'organized':
          insights.strengths.push('You handle time management and planning well');
          break;
        case 'open_minded':
          insights.strengths.push('You are open to feedback and new perspectives');
          break;
      }
    } else if (score <= 1) {
      switch (trait) {
        case 'anxious':
          insights.concerns.push('You may experience anxiety in stressful situations');
          insights.recommendations.push('Practice relaxation techniques and consider professional support');
          break;
        case 'avoidant':
          insights.concerns.push('You may avoid challenging situations');
          insights.recommendations.push('Try gradual exposure to build confidence');
          break;
        case 'self_doubting':
          insights.concerns.push('You may struggle with self-confidence');
          insights.recommendations.push('Practice positive self-talk and celebrate small wins');
          break;
        case 'overwhelmed':
          insights.concerns.push('You may feel overwhelmed easily');
          insights.recommendations.push('Break tasks into smaller steps and practice time management');
          break;
      }
    }
  });

  return insights;
};

// Generate combined insights
const generateCombinedInsights = (sectionScores, insights) => {
  const combined = {
    strengths: [...insights.lifestyle.strengths, ...insights.personality.strengths],
    concerns: [...insights.lifestyle.concerns, ...insights.personality.concerns],
    recommendations: [...insights.lifestyle.recommendations, ...insights.personality.recommendations]
  };

  // Remove duplicates
  combined.strengths = [...new Set(combined.strengths)];
  combined.concerns = [...new Set(combined.concerns)];
  combined.recommendations = [...new Set(combined.recommendations)];

  return combined;
};

// Determine risk level
const determineRiskLevel = (totalScore, maxScore, insights) => {
  const percentage = (totalScore / maxScore) * 100;
  
  // Check for high-risk indicators
  const hasHighStress = insights.lifestyle?.concerns?.some(concern => 
    concern.includes('High stress levels') || concern.includes('Poor sleep quality')
  );
  
  const hasAnxietyConcerns = insights.personality?.concerns?.some(concern => 
    concern.includes('anxiety') || concern.includes('overwhelmed')
  );

  if (percentage < 30 || hasHighStress || hasAnxietyConcerns) {
    return 'high';
  } else if (percentage < 60) {
    return 'moderate';
  } else {
    return 'low';
  }
};

// Generate overall interpretation
const generateOverallInterpretation = (totalScore, maxScore, sectionsCompleted) => {
  const percentage = (totalScore / maxScore) * 100;
  
  if (sectionsCompleted === 1) {
    return percentage >= 70 ? 'Your responses suggest good mental health indicators' : 
           percentage >= 50 ? 'Your responses show some areas for improvement' : 
           'Your responses indicate some concerns that may benefit from attention';
  } else {
    return percentage >= 70 ? 'Your comprehensive assessment shows strong mental health indicators' : 
           percentage >= 50 ? 'Your assessment reveals some areas for growth and improvement' : 
           'Your assessment indicates several areas that may benefit from professional support';
  }
};

// Get score level
const getScoreLevel = (totalScore, maxScore) => {
  const percentage = (totalScore / maxScore) * 100;
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'fair';
  return 'needs_attention';
};

// Get score color
const getScoreColor = (totalScore, maxScore) => {
  const percentage = (totalScore / maxScore) * 100;
  if (percentage >= 80) return '#22C55E';
  if (percentage >= 60) return '#EAB308';
  if (percentage >= 40) return '#F97316';
  return '#EF4444';
};

// Generate comprehensive recommendations
const generateComprehensiveRecommendations = (type, scoringResults, completedSections) => {
  const recommendations = [];

  if (type === 'comprehensive') {
    const { insights, riskLevel } = scoringResults;
    
    // Add specific recommendations based on completed sections
    if (completedSections.includes('section1')) {
      recommendations.push('Focus on maintaining healthy lifestyle habits');
      if (insights.lifestyle?.recommendations) {
        recommendations.push(...insights.lifestyle.recommendations);
      }
    }
    
    if (completedSections.includes('section2')) {
      recommendations.push('Work on developing emotional resilience');
      if (insights.personality?.recommendations) {
        recommendations.push(...insights.personality.recommendations);
      }
    }
    
    // Add risk-based recommendations
    if (riskLevel === 'high') {
      recommendations.push('Consider speaking with a mental health professional');
      recommendations.push('Practice daily stress management techniques');
    } else if (riskLevel === 'moderate') {
      recommendations.push('Continue monitoring your mental health');
      recommendations.push('Consider joining a support group or community');
    } else {
      recommendations.push('Maintain your positive mental health practices');
      recommendations.push('Consider helping others as a way to maintain wellbeing');
    }
  } else {
    // Legacy recommendations for other assessment types
    return generateRecommendations(type, scoringResults);
  }

  return [...new Set(recommendations)]; // Remove duplicates
};


// Module exports will be at the end of the file

module.exports = {
  getTemplates: exports.getTemplates,
  getTemplate: exports.getTemplate,
  submitAssessment: exports.submitAssessment,
  getHistory: exports.getHistory
};