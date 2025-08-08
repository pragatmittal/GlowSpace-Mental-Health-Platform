const EmotionData = require('../models/EmotionData');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// @desc    Store emotion analysis data
// @route   POST /api/emotions/analyze
// @access  Private
exports.analyzeEmotion = async (req, res) => {
  try {
    console.log('Emotion analysis request received:', {
      userId: req.user?.id,
      bodyKeys: Object.keys(req.body),
      hasReadings: !!req.body.readings,
      hasEmotions: !!req.body.emotions
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Validate user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { readings, sessionId, metadata } = req.body;

    // Handle both single reading and batch readings
    let emotionReadings = [];
    
    if (readings && Array.isArray(readings)) {
      emotionReadings = readings;
    } else if (req.body.emotions) {
      emotionReadings = [{ 
      emotions: req.body.emotions,
        wellnessScore: req.body.wellnessScore || 50,
      timestamp: req.body.timestamp || new Date()
    }];
    } else {
      return res.status(400).json({
        success: false,
        message: 'No emotion data provided. Please provide either "readings" array or "emotions" object.'
      });
    }

    console.log('Processing emotion readings:', emotionReadings.length);

    // Process each reading
    const savedReadings = await Promise.all(emotionReadings.map(async (reading, index) => {
      try {
      const { emotions, wellnessScore, timestamp } = reading;

        // Validate emotions object
        if (!emotions || typeof emotions !== 'object') {
          throw new Error(`Invalid emotions data at index ${index}`);
        }

      // Calculate dominant emotion
      let maxEmotion = 'neutral';
      let maxValue = 0;
      
      for (const [emotion, value] of Object.entries(emotions)) {
          if (typeof value === 'number' && value > maxValue) {
          maxValue = value;
          maxEmotion = emotion;
        }
      }

      // Create emotion data record
      const emotionData = new EmotionData({
        userId: req.user.id,
        emotions,
        dominantEmotion: maxEmotion,
        confidence: maxValue,
          wellnessScore: wellnessScore || 50,
        sessionId: sessionId || uuidv4(),
        metadata,
        createdAt: timestamp
      });

      await emotionData.save();
        console.log(`Saved emotion reading ${index + 1}/${emotionReadings.length}`);
      return emotionData;
      } catch (error) {
        console.error(`Error processing reading ${index}:`, error);
        throw error;
      }
    }));

    // Update user's last emotion analysis timestamp
    try {
    await User.findByIdAndUpdate(req.user.id, {
      'mentalHealthData.lastEmotionAnalysis': new Date(),
      'mentalHealthData.wellnessScore': savedReadings[savedReadings.length - 1].wellnessScore
    });
    } catch (updateError) {
      console.error('Error updating user data:', updateError);
      // Don't fail the request if user update fails
    }

    res.status(201).json({
      success: true,
      message: 'Emotion analysis stored successfully',
      data: {
        count: savedReadings.length,
        sessionId,
        lastReading: {
          id: savedReadings[savedReadings.length - 1]._id,
          dominantEmotion: savedReadings[savedReadings.length - 1].dominantEmotion,
          confidence: savedReadings[savedReadings.length - 1].confidence,
          wellnessScore: savedReadings[savedReadings.length - 1].wellnessScore,
          timestamp: savedReadings[savedReadings.length - 1].createdAt
        }
      }
    });
  } catch (error) {
    console.error('Emotion analysis detailed error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error during emotion analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's emotion history
// @route   GET /api/emotions/history
// @access  Private
exports.getEmotionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const emotions = await EmotionData.find({
      userId: req.user.id,
      createdAt: { $gte: startDate },
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

    const totalCount = await EmotionData.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: startDate },
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        emotions,
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
    console.error('Get emotion history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving emotion history'
    });
  }
};

// @desc    Get emotion trends and analytics
// @route   GET /api/emotions/trends
// @access  Private
exports.getEmotionTrends = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const trends = await EmotionData.getEmotionTrends(req.user.id, parseInt(days));

    res.status(200).json({
      success: true,
      data: {
        trends,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get emotion trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving emotion trends'
    });
  }
};

// @desc    Get emotion distribution
// @route   GET /api/emotions/distribution
// @access  Private
exports.getEmotionDistribution = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const distribution = await EmotionData.getEmotionDistribution(req.user.id, parseInt(days));

    res.status(200).json({
      success: true,
      data: {
        distribution,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get emotion distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving emotion distribution'
    });
  }
};

// @desc    Get emotion insights and recommendations
// @route   GET /api/emotions/insights
// @access  Private
exports.getEmotionInsights = async (req, res) => {
  try {
    console.log('Getting emotion insights:', {
      userId: req.user?.id,
      query: req.query
    });

    const userId = req.user.id;
    const { days = 7 } = req.query;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get recent emotion data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    console.log('Fetching emotions from:', startDate);
    
    const recentEmotions = await EmotionData.find({
      userId,
      createdAt: { $gte: startDate },
      isActive: true
    }).sort({ createdAt: -1 }).limit(50);

    console.log('Found emotions:', recentEmotions.length);

    if (recentEmotions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          insights: [],
          recommendations: ['Start tracking your emotions regularly to get personalized insights'],
          wellnessScore: 50,
          emotionSummary: {},
          period: `${days} days`,
          totalReadings: 0
        }
      });
    }

    // Calculate insights
    const insights = [];
    const recommendations = [];
    
    // Analyze emotion patterns
    const emotionCounts = {};
    let totalWellnessScore = 0;
    
    recentEmotions.forEach(emotion => {
      const dominant = emotion.dominantEmotion;
      emotionCounts[dominant] = (emotionCounts[dominant] || 0) + 1;
      totalWellnessScore += emotion.wellnessScore || 50;
    });
    
    const averageWellnessScore = Math.round(totalWellnessScore / recentEmotions.length);
    const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
    
    // Generate insights
    insights.push({
      type: 'dominant_emotion',
      title: 'Most Common Emotion',
      description: `Your most frequent emotion in the last ${days} days has been ${mostCommonEmotion}`,
      value: mostCommonEmotion,
      count: emotionCounts[mostCommonEmotion]
    });
    
    insights.push({
      type: 'wellness_score',
      title: 'Average Wellness Score',
      description: `Your average wellness score is ${averageWellnessScore}/100`,
      value: averageWellnessScore,
      trend: averageWellnessScore > 70 ? 'positive' : averageWellnessScore > 50 ? 'neutral' : 'concerning'
    });
    
    // Generate recommendations
    if (averageWellnessScore < 50) {
      recommendations.push('Consider scheduling a counseling session to discuss your recent emotional patterns');
      recommendations.push('Try engaging in our healing games to improve your mood');
    } else if (averageWellnessScore < 70) {
      recommendations.push('Your wellness score is moderate. Consider starting a mindfulness challenge');
      recommendations.push('Regular mood tracking can help identify patterns and triggers');
    } else {
      recommendations.push('Great job maintaining positive emotional health!');
      recommendations.push('Consider sharing your wellness journey in our chat support community');
    }
    
    if (emotionCounts.sad > emotionCounts.happy) {
      recommendations.push('We noticed higher levels of sadness. Consider reaching out to our support team');
    }
    
    if (emotionCounts.angry > 2) {
      recommendations.push('Try anger management techniques or schedule a session with a counselor');
    }

    console.log('Generated insights:', {
      insightsCount: insights.length,
      recommendationsCount: recommendations.length,
      averageWellnessScore
    });

    res.status(200).json({
      success: true,
      data: {
        insights,
        recommendations,
        wellnessScore: averageWellnessScore,
        emotionSummary: emotionCounts,
        period: `${days} days`,
        totalReadings: recentEmotions.length
      }
    });
  } catch (error) {
    console.error('Get emotion insights detailed error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error retrieving emotion insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete emotion data
// @route   DELETE /api/emotions/:id
// @access  Private
exports.deleteEmotionData = async (req, res) => {
  try {
    const emotionData = await EmotionData.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!emotionData) {
      return res.status(404).json({
        success: false,
        message: 'Emotion data not found'
      });
    }

    // Soft delete
    emotionData.isActive = false;
    await emotionData.save();

    res.status(200).json({
      success: true,
      message: 'Emotion data deleted successfully'
    });
  } catch (error) {
    console.error('Delete emotion data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting emotion data'
    });
  }
};

// @desc    Get emotion session data
// @route   GET /api/emotions/session/:sessionId
// @access  Private
exports.getEmotionSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionData = await EmotionData.find({
      userId: req.user.id,
      sessionId,
      isActive: true
    }).sort({ createdAt: 1 });

    if (sessionData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emotion session not found'
      });
    }

    // Calculate session summary
    const sessionSummary = {
      totalReadings: sessionData.length,
      duration: sessionData.length > 1 ? 
        (new Date(sessionData[sessionData.length - 1].createdAt) - new Date(sessionData[0].createdAt)) / 1000 : 0,
      averageWellnessScore: sessionData.reduce((sum, data) => sum + data.calculateWellnessScore(), 0) / sessionData.length,
      emotionProgression: sessionData.map(data => ({
        timestamp: data.createdAt,
        dominantEmotion: data.dominantEmotion,
        confidence: data.confidence,
        wellnessScore: data.calculateWellnessScore()
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        sessionData,
        sessionSummary
      }
    });
  } catch (error) {
    console.error('Get emotion session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving emotion session'
    });
  }
};

// @desc    Update emotion data contextual information
// @route   PUT /api/emotions/:id/context
// @access  Private
exports.updateEmotionContext = async (req, res) => {
  try {
    const { timeOfDay, location, activity, notes } = req.body;
    
    const emotionData = await EmotionData.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!emotionData) {
      return res.status(404).json({
        success: false,
        message: 'Emotion data not found'
      });
    }

    // Update contextual data
    emotionData.contextualData = {
      timeOfDay,
      location,
      activity,
      notes
    };

    await emotionData.save();

    res.status(200).json({
      success: true,
      message: 'Contextual data updated successfully',
      data: emotionData
    });
  } catch (error) {
    console.error('Update emotion context error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating contextual data'
    });
  }
};
