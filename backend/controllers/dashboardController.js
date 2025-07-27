const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const EmotionData = require('../models/EmotionData');
const Assessment = require('../models/Assessment');
const Appointment = require('../models/Appointment');

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching dashboard data for user:', userId);
        
        // Initialize with empty arrays/objects in case of no data
        let moodTrends = [];
        let emotionTrends = [];
        let recentAppointments = [];
        let recentActivities = {};
        
        try {
            moodTrends = await MoodEntry.getMoodTrends(userId, 7) || [];
        } catch (error) {
            console.log('No mood data available for user');
        }
        
        try {
            emotionTrends = await EmotionData.getEmotionTrends(userId, 7) || [];
        } catch (error) {
            console.log('No emotion data available for user');
        }
        
        try {
            recentAppointments = await Appointment.getUserAppointments(userId, 5) || [];
        } catch (error) {
            console.log('No appointment data available for user');
        }
        
        try {
            recentActivities = await getRecentActivitiesData(userId) || {};
        } catch (error) {
            console.log('No activity data available for user');
        }

        // --- NEW: Get latest emotion session ---
        let latestSession = null;
        let latestSessionId = null;
        let latestSessionData = [];
        let latestSessionSummary = null;
        let recommendations = [];

        try {
        // Find the most recent EmotionData entry for the user
        const latestEmotion = await EmotionData.findOne({ userId }).sort({ createdAt: -1 });
        if (latestEmotion) {
            latestSessionId = latestEmotion.sessionId;
            latestSessionData = await EmotionData.find({ userId, sessionId: latestSessionId }).sort({ createdAt: 1 });
            // Aggregate session data
            if (latestSessionData.length > 0) {
                // Calculate average wellness score and emotion progression
                const totalScore = latestSessionData.reduce((sum, d) => sum + (d.wellnessScore || 0), 0);
                const avgWellnessScore = Math.round(totalScore / latestSessionData.length);
                const emotionProgression = latestSessionData.map(d => ({
                    timestamp: d.createdAt,
                    dominantEmotion: d.dominantEmotion,
                    confidence: d.confidence,
                    wellnessScore: d.wellnessScore
                }));
                // Use the last entry for recommendations
                recommendations = latestSessionData[latestSessionData.length - 1].generateRecommendations();
                latestSessionSummary = {
                    sessionId: latestSessionId,
                    totalReadings: latestSessionData.length,
                    averageWellnessScore: avgWellnessScore,
                    emotionProgression,
                    recommendations
                };
                latestSession = {
                    sessionId: latestSessionId,
                    summary: latestSessionSummary,
                    data: emotionProgression
                };
            }
            }
        } catch (error) {
            console.log('No emotion session data available for user');
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    isVerified: req.user.isVerified,
                    mentalHealthData: req.user.mentalHealthData
                },
                moodTrends,
                emotionTrends,
                recentAppointments,
                recentActivities,
                latestSession // <-- new field for frontend
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard data",
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
    getDashboardData,
    getUserProgress,
    getEmotionTrends,
    getActivitySummary,
    getGoalProgress,
    getRecentActivities,
};

