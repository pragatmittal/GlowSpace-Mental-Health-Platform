const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const EmotionData = require('../models/EmotionData');
const Assessment = require('../models/Assessment');
const Appointment = require('../models/Appointment');
const Goal = require('../models/Goal');
const mongoose = require('mongoose');

// @desc    Get dashboard data
// @route   GET /api/dashboard/data
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching dashboard data for user:', userId);

    // Get user data
    const user = await User.findById(userId).select('-password');

    // Get recent mood entries
    const recentMoods = await MoodEntry.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent emotion data
    const recentEmotionData = await EmotionData.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent appointments
    const recentAppointments = await Appointment.find({ userId, isActive: true })
      .sort({ scheduledDate: 1 })
      .limit(5);

    // Get goals summary
    const Goal = require('../models/Goal');
    const goalsSummary = await Goal.getGoalsSummary(userId);

    // Get recent activities
    const recentActivities = {
      recentMoods,
      recentEmotionData,
      recentAppointments
    };

    // Get latest session data
    const latestSession = recentEmotionData.length > 0 ? {
      sessionId: recentEmotionData[0].sessionId,
      summary: {
        sessionId: recentEmotionData[0].sessionId,
        totalReadings: recentEmotionData.length,
        averageWellnessScore: recentEmotionData.reduce((sum, data) => sum + data.wellnessScore, 0) / recentEmotionData.length,
        emotionProgression: recentEmotionData.map(data => ({
          timestamp: data.createdAt,
          dominantEmotion: data.dominantEmotion,
          confidence: data.confidence,
          wellnessScore: data.wellnessScore
        })),
        recommendations: []
      },
      data: recentEmotionData.map(data => ({
        timestamp: data.createdAt,
        dominantEmotion: data.dominantEmotion,
        confidence: data.confidence,
        wellnessScore: data.wellnessScore
      }))
    } : null;

    res.status(200).json({
      success: true,
      data: {
        user,
        moodTrends: await MoodEntry.getMoodTrends(userId, 7),
        emotionTrends: await EmotionData.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              emotions: {
                $push: {
                  emotion: "$dominantEmotion",
                  confidence: "$confidence"
                }
              },
              wellnessScore: { $avg: "$wellnessScore" }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 7 }
        ]),
        recentAppointments,
        recentActivities,
        latestSession,
        goalsSummary
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const moodTrends = await MoodEntry.getMoodTrends(userId, 30) || [];
        const assessmentAnalytics = await Assessment.getAssessmentAnalytics(userId, 30) || {};

        res.status(200).json({
            success: true,
            data: {
                moodTrends,
                assessmentAnalytics
            }
        });
    } catch (error) {
        console.error('User progress error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user progress",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getEmotionTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const emotionTrends = await EmotionData.getEmotionTrends(userId, 7) || [];

        res.status(200).json({
            success: true,
            data: emotionTrends
        });
    } catch (error) {
        console.error('Emotion trends error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching emotion trends",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getActivitySummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const recentMoods = await MoodEntry.find({ userId, isActive: true })
            .limit(5)
            .sort({ createdAt: -1 })
            .lean() || [];
            
        const recentAssessments = await Assessment.getUserAssessments(userId, null, 5) || [];

        res.status(200).json({
            success: true,
            data: {
                recentMoods,
                recentAssessments
            }
        });
    } catch (error) {
        console.error('Activity summary error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching activity summary",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getGoalProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('mentalHealthData').lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                currentChallenge: user.mentalHealthData?.currentChallenge,
                challengeStartDate: user.mentalHealthData?.challengeStartDate,
                wellnessScore: user.mentalHealthData?.wellnessScore
            }
        });
    } catch (error) {
        console.error('Goal progress error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching goal progress",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getRecentActivities = async (req, res) => {
    try {
        const userId = req.user.id;
        const activities = await getRecentActivitiesData(userId);

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Recent activities error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching recent activities",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getRecentActivitiesData = async (userId) => {
    try {
        const recentMoods = await MoodEntry.find({ userId, isActive: true })
            .limit(5)
            .sort({ createdAt: -1 })
            .lean() || [];
            
        const recentEmotionData = await EmotionData.find({ userId, isActive: true })
            .limit(5)
            .sort({ createdAt: -1 })
            .lean() || [];
            
        const recentAppointments = await Appointment.getUserAppointments(userId, 5) || [];

        return {
            recentMoods,
            recentEmotionData,
            recentAppointments
        };
    } catch (error) {
        console.error('Recent activities data error:', error);
        throw new Error("Error fetching recent activities data");
    }
};

module.exports = {
    getDashboardData: exports.getDashboardData,
    getUserProgress,
    getEmotionTrends,
    getActivitySummary,
    getGoalProgress,
    getRecentActivities,
};

