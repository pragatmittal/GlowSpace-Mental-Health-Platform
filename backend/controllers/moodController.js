const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Sentiment = require('sentiment');
const moment = require('moment');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed!'));
    }
  }
});

// @desc    Create a new mood entry
// @route   POST /api/mood/entry
// @access  Private
exports.createMoodEntry = async (req, res) => {
  try {
    const {
      mood,
      intensity,
      moodWheel,
      voiceRecording,
      photo,
      timeOfDay,
      activity,
      socialContext,
      location,
      weather,
      notes,
      tags,
      entryMethod
    } = req.body;

    // Enhanced validation
    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required',
        field: 'mood'
      });
    }

    // Validate mood value
    const validMoods = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood value',
        field: 'mood',
        validValues: validMoods
      });
    }

    // Validate intensity if provided
    if (intensity !== undefined) {
      if (typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
        return res.status(400).json({
          success: false,
          message: 'Intensity must be a number between 1 and 10',
          field: 'intensity'
        });
      }
    }

    // Validate moodWheel if provided
    if (moodWheel) {
      if (typeof moodWheel !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Mood wheel data must be an object',
          field: 'moodWheel'
        });
      }
      
      if (moodWheel.x !== undefined && (typeof moodWheel.x !== 'number' || moodWheel.x < -1 || moodWheel.x > 1)) {
        return res.status(400).json({
          success: false,
          message: 'Mood wheel X coordinate must be a number between -1 and 1',
          field: 'moodWheel.x'
        });
      }
      
      if (moodWheel.y !== undefined && (typeof moodWheel.y !== 'number' || moodWheel.y < -1 || moodWheel.y > 1)) {
        return res.status(400).json({
          success: false,
          message: 'Mood wheel Y coordinate must be a number between -1 and 1',
          field: 'moodWheel.y'
        });
      }
    }

    // Validate timeOfDay if provided
    if (timeOfDay) {
      const validTimeOfDay = ['morning', 'afternoon', 'evening', 'night'];
      if (!validTimeOfDay.includes(timeOfDay)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time of day',
          field: 'timeOfDay',
          validValues: validTimeOfDay
        });
      }
    }

    // Validate activity if provided
    if (activity) {
      const validActivities = ['work', 'study', 'exercise', 'social', 'relaxation', 'creative', 'outdoor', 'indoor', 'travel', 'family', 'friends', 'alone', 'therapy', 'other'];
      if (!validActivities.includes(activity)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity',
          field: 'activity',
          validValues: validActivities
        });
      }
    }

    // Validate socialContext if provided
    if (socialContext) {
      const validSocialContexts = ['alone', 'with_friends', 'with_family', 'at_work', 'in_public', 'at_home', 'online', 'offline', 'mixed'];
      if (!validSocialContexts.includes(socialContext)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid social context',
          field: 'socialContext',
          validValues: validSocialContexts
        });
      }
    }

    // Validate notes length
    if (notes && notes.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Notes must be less than 1000 characters',
        field: 'notes',
        maxLength: 1000
      });
    }

    // Validate tags
    if (tags) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: 'Tags must be an array',
          field: 'tags'
        });
      }
      
      if (tags.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 tags allowed',
          field: 'tags',
          maxTags: 10
        });
      }
      
      for (let i = 0; i < tags.length; i++) {
        if (typeof tags[i] !== 'string' || tags[i].length < 1 || tags[i].length > 20) {
          return res.status(400).json({
            success: false,
            message: `Tag ${i + 1} must be a string between 1 and 20 characters`,
            field: `tags[${i}]`
          });
        }
      }
    }

    // Validate entryMethod if provided
    if (entryMethod) {
      const validEntryMethods = ['quick_button', 'mood_wheel', 'voice', 'photo', 'manual'];
      if (!validEntryMethods.includes(entryMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid entry method',
          field: 'entryMethod',
          validValues: validEntryMethods
        });
      }
    }

    // Determine time of day if not provided
    let timeOfDayValue = timeOfDay;
    if (!timeOfDayValue) {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) timeOfDayValue = 'morning';
      else if (hour >= 12 && hour < 18) timeOfDayValue = 'afternoon';
      else if (hour >= 18 && hour < 24) timeOfDayValue = 'evening';
      else timeOfDayValue = 'night';
    }

    // Analyze sentiment from notes
    let sentiment = null;
    if (notes) {
      try {
        const sentimentAnalyzer = new Sentiment();
        const result = sentimentAnalyzer.analyze(notes);
        sentiment = {
          score: Math.max(-1, Math.min(1, result.score / 10)), // Normalize to -1 to 1
          label: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
          keywords: result.positive.concat(result.negative),
          analysis: result.words.join(' ')
        };
      } catch (sentimentError) {
        console.warn('Sentiment analysis failed:', sentimentError.message);
        // Continue without sentiment analysis
      }
    }

    // Create mood entry with defaults
    const moodEntry = new MoodEntry({
      userId: req.user.id,
      mood,
      intensity: intensity || 5,
      moodWheel,
      voiceRecording,
      photo,
      timeOfDay: timeOfDayValue,
      activity: activity || 'other',
      socialContext: socialContext || 'alone',
      location,
      weather,
      notes,
      tags: tags || [],
      sentiment,
      entryMethod: entryMethod || 'manual'
    });

    // Save the mood entry
    await moodEntry.save();

    // Generate insights for this entry
    try {
      const insights = await MoodEntry.generateInsights(req.user.id, 30);
      moodEntry.insights = insights.slice(0, 3); // Keep top 3 insights
    } catch (insightError) {
      console.log('Could not generate insights:', insightError.message);
      // Continue without insights if generation fails
    }

    // Check for alerts
    const alerts = [];
    
    // Check for declining mood
    const recentEntries = await MoodEntry.find({
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 }).limit(7);

    if (recentEntries.length >= 3) {
      const recentAvg = recentEntries.reduce((sum, e) => {
        const moodIndex = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(e.mood);
        return sum + moodIndex;
      }, 0) / recentEntries.length;

      const currentMoodIndex = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(mood);
      
      if (currentMoodIndex < recentAvg - 1) {
        alerts.push({
          type: 'declining_mood',
          message: 'Your mood has been declining. Consider reaching out for support.',
          severity: 'warning',
          triggered: true,
          actionRequired: true
        });
      }
    }

    // Check for crisis indicators
    if (mood === 'very_sad' && intensity >= 8) {
      alerts.push({
        type: 'crisis',
        message: 'You seem to be having a difficult time. Please reach out to a mental health professional or crisis hotline.',
        severity: 'critical',
        triggered: true,
        actionRequired: true
      });
    }

    moodEntry.alerts = alerts;

    await moodEntry.save();

    // Update user's last mood entry
    await User.findByIdAndUpdate(req.user.id, {
      'mentalHealthData.lastMoodEntry': new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      data: moodEntry
    });

  } catch (error) {
    console.error('Create mood entry error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        field: error.path
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating mood entry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user's mood entries
// @route   GET /api/mood/entries
// @access  Private
exports.getMoodEntries = async (req, res) => {
  try {
    const { page = 1, limit = 20, timeRange = '30d', mood, activity, socialContext } = req.query;

    // Validate query parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
        field: 'page'
      });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
        field: 'limit'
      });
    }

    // Validate timeRange
    const validTimeRanges = ['7d', '30d', '90d', 'all'];
    if (!validTimeRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time range',
        field: 'timeRange',
        validValues: validTimeRanges
      });
    }

    // Validate mood filter
    if (mood) {
      const validMoods = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'];
      if (!validMoods.includes(mood)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mood filter',
          field: 'mood',
          validValues: validMoods
        });
      }
    }

    // Validate activity filter
    if (activity) {
      const validActivities = ['work', 'study', 'exercise', 'social', 'relaxation', 'creative', 'outdoor', 'indoor', 'travel', 'family', 'friends', 'alone', 'therapy', 'other'];
      if (!validActivities.includes(activity)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity filter',
          field: 'activity',
          validValues: validActivities
        });
      }
    }

    // Validate socialContext filter
    if (socialContext) {
      const validSocialContexts = ['alone', 'with_friends', 'with_family', 'at_work', 'in_public', 'at_home', 'online', 'offline', 'mixed'];
      if (!validSocialContexts.includes(socialContext)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid social context filter',
          field: 'socialContext',
          validValues: validSocialContexts
        });
      }
    }

    const query = {
      userId: req.user.id,
      isActive: true
    };

    // Add filters
    if (mood) query.mood = mood;
    if (activity) query.activity = activity;
    if (socialContext) query.socialContext = socialContext;

    // Add time range filter
    if (timeRange !== 'all') {
      const days = parseInt(timeRange.replace('d', ''));
      if (isNaN(days) || days < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time range format',
          field: 'timeRange'
        });
      }
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query.createdAt = { $gte: startDate };
    }

    const skip = (pageNum - 1) * limitNum;

    const entries = await MoodEntry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name avatar');

    const total = await MoodEntry.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalEntries: total,
          hasNext: skip + entries.length < total,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get mood entries error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format in query parameters',
        field: error.path
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching mood entries',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get mood analytics
// @route   GET /api/mood/analytics
// @access  Private
exports.getMoodAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const days = parseInt(timeRange.replace('d', ''));

    // Get mood trends
    const trends = await MoodEntry.getMoodTrends(req.user.id, days);

    // Get mood patterns
    const patterns = await MoodEntry.getMoodPatterns(req.user.id, days);

    // Get mood streaks
    const streaks = await MoodEntry.getMoodStreaks(req.user.id);

    // Get insights
    const insights = await MoodEntry.generateInsights(req.user.id, days);

    // Calculate summary statistics
    const entries = await MoodEntry.find({
      userId: req.user.id,
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });

    const moodCounts = {
      very_happy: 0,
      happy: 0,
      neutral: 0,
      sad: 0,
      very_sad: 0
    };

    const activityMood = {};
    const timeMood = {};
    const socialMood = {};

    entries.forEach(entry => {
      moodCounts[entry.mood]++;
      
      // Activity correlation
      if (!activityMood[entry.activity]) {
        activityMood[entry.activity] = { total: 0, sum: 0 };
      }
      activityMood[entry.activity].total++;
      activityMood[entry.activity].sum += ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(entry.mood);

      // Time correlation
      if (!timeMood[entry.timeOfDay]) {
        timeMood[entry.timeOfDay] = { total: 0, sum: 0 };
      }
      timeMood[entry.timeOfDay].total++;
      timeMood[entry.timeOfDay].sum += ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(entry.mood);

      // Social correlation
      if (!socialMood[entry.socialContext]) {
        socialMood[entry.socialContext] = { total: 0, sum: 0 };
      }
      socialMood[entry.socialContext].total++;
      socialMood[entry.socialContext].sum += ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(entry.mood);
    });

    // Calculate averages
    Object.keys(activityMood).forEach(activity => {
      activityMood[activity].average = activityMood[activity].sum / activityMood[activity].total;
    });

    Object.keys(timeMood).forEach(time => {
      timeMood[time].average = timeMood[time].sum / timeMood[time].total;
    });

    Object.keys(socialMood).forEach(social => {
      socialMood[social].average = socialMood[social].sum / socialMood[social].total;
    });

    res.status(200).json({
      success: true,
      data: {
        trends: entries.length > 0 ? trends : [],
        patterns: entries.length > 0 ? patterns : [],
        streaks: entries.length > 0 ? streaks : { currentPositiveStreak: 0, maxPositiveStreak: 0, currentTrackingStreak: 0, maxTrackingStreak: 0 },
        insights: entries.length > 0 ? insights : [],
        summary: {
          totalEntries: entries.length,
          moodDistribution: moodCounts,
          averageIntensity: entries.length > 0 ? entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length : 0,
          activityCorrelation: activityMood,
          timeCorrelation: timeMood,
          socialCorrelation: socialMood
        }
      }
    });

  } catch (error) {
    console.error('Get mood analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get mood patterns
// @route   GET /api/mood/patterns
// @access  Private
exports.getMoodPatterns = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const patterns = await MoodEntry.getMoodPatterns(req.user.id, parseInt(days));

    res.status(200).json({
      success: true,
      data: patterns
    });

  } catch (error) {
    console.error('Get mood patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood patterns',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get mood streaks
// @route   GET /api/mood/streaks
// @access  Private
exports.getMoodStreaks = async (req, res) => {
  try {
    const streaks = await MoodEntry.getMoodStreaks(req.user.id);

    res.status(200).json({
      success: true,
      data: streaks
    });

  } catch (error) {
    console.error('Get mood streaks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood streaks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update mood entry
// @route   PUT /api/mood/entry/:id
// @access  Private
exports.updateMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // First find the entry without user restriction
    const moodEntry = await MoodEntry.findOne({
      _id: id,
      isActive: true
    });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if user owns this entry
    if (moodEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this entry'
      });
    }

    // Update sentiment if notes changed
    if (updateData.notes && updateData.notes !== moodEntry.notes) {
      const sentimentAnalyzer = new Sentiment();
      const result = sentimentAnalyzer.analyze(updateData.notes);
      updateData.sentiment = {
        score: Math.max(-1, Math.min(1, result.score / 10)),
        label: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
        keywords: result.positive.concat(result.negative),
        analysis: result.words.join(' ')
      };
    }

    const updatedEntry = await MoodEntry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Mood entry updated successfully',
      data: updatedEntry
    });

  } catch (error) {
    console.error('Update mood entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mood entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete mood entry
// @route   DELETE /api/mood/entry/:id
// @access  Private
exports.deleteMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the entry without user restriction
    const moodEntry = await MoodEntry.findOne({
      _id: id,
      isActive: true
    });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if user owns this entry
    if (moodEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this entry'
      });
    }

    // Soft delete
    moodEntry.isActive = false;
    await moodEntry.save();

    res.status(200).json({
      success: true,
      message: 'Mood entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting mood entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload voice recording
// @route   POST /api/mood/upload/voice
// @access  Private
exports.uploadVoiceRecording = async (req, res) => {
  try {
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file provided'
        });
      }

      // Here you would typically:
      // 1. Process the audio file
      // 2. Convert to text using speech-to-text service
      // 3. Analyze sentiment
      // 4. Store the processed data

      const voiceData = {
        audioUrl: `/uploads/${req.file.filename}`,
        duration: req.body.duration || 0,
        transcript: req.body.transcript || '',
        sentiment: {
          score: 0,
          label: 'neutral',
          confidence: 0.5
        }
      };

      res.status(200).json({
        success: true,
        message: 'Voice recording uploaded successfully',
        data: voiceData
      });
    });

  } catch (error) {
    console.error('Upload voice recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading voice recording',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload photo
// @route   POST /api/mood/upload/photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Here you would typically:
      // 1. Process the image
      // 2. Analyze facial expressions
      // 3. Detect emotions
      // 4. Store the processed data

      const photoData = {
        imageUrl: `/uploads/${req.file.filename}`,
        facialExpression: {
          dominant: 'neutral',
          confidence: 0.5,
          emotions: {
            happy: 0,
            sad: 0,
            angry: 0,
            fearful: 0,
            disgusted: 0,
            surprised: 0,
            neutral: 100
          }
        }
      };

      res.status(200).json({
        success: true,
        message: 'Photo uploaded successfully',
        data: photoData
      });
    });

  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get mood insights
// @route   GET /api/mood/insights
// @access  Private
exports.getMoodInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const insights = await MoodEntry.generateInsights(req.user.id, parseInt(days));

    res.status(200).json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Get mood insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Acknowledge alert
// @route   PUT /api/mood/alert/:id/acknowledge
// @access  Private
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const moodEntry = await MoodEntry.findOne({
      'alerts._id': id,
      userId: req.user.id,
      isActive: true
    });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Update the specific alert
    await MoodEntry.updateOne(
      { 'alerts._id': id },
      { $set: { 'alerts.$.acknowledged': true } }
    );

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully'
    });

  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 