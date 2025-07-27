const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Basic Mood Data
  mood: {
    type: String,
    enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'],
    required: true
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  
  // Mood Wheel Data
  moodWheel: {
    x: { type: Number, min: -1, max: 1 }, // Wheel coordinates
    y: { type: Number, min: -1, max: 1 },
    color: String,
    angle: Number, // Angle in degrees
    distance: Number // Distance from center
  },
  
  // Voice Entry Data
  voiceRecording: {
    audioUrl: String,
    duration: Number, // in seconds
    transcript: String,
    sentiment: {
      score: { type: Number, min: -1, max: 1 },
      label: { type: String, enum: ['positive', 'negative', 'neutral'] },
      confidence: { type: Number, min: 0, max: 1 }
    }
  },
  
  // Photo Entry Data
  photo: {
    imageUrl: String,
    facialExpression: {
      dominant: { type: String, enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'] },
      confidence: { type: Number, min: 0, max: 1 },
      emotions: {
        happy: { type: Number, min: 0, max: 100 },
        sad: { type: Number, min: 0, max: 100 },
        angry: { type: Number, min: 0, max: 100 },
        fearful: { type: Number, min: 0, max: 100 },
        disgusted: { type: Number, min: 0, max: 100 },
        surprised: { type: Number, min: 0, max: 100 },
        neutral: { type: Number, min: 0, max: 100 }
      }
    }
  },
  
  // Contextual Tracking
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    required: true
  },
  activity: {
    type: String,
    enum: ['work', 'study', 'exercise', 'social', 'relaxation', 'creative', 'outdoor', 'indoor', 'travel', 'family', 'friends', 'alone', 'therapy', 'other'],
    default: 'other'
  },
  socialContext: {
    type: String,
    enum: ['alone', 'with_friends', 'with_family', 'at_work', 'in_public', 'at_home', 'online', 'offline', 'mixed'],
    default: 'alone'
  },
  
  // Location & Weather
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String,
    place: String
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
    pressure: Number
  },
  
  // Notes & Tags
  notes: {
    type: String,
    maxlength: 1000
  },
  tags: [String],
  
  // Sentiment Analysis
  sentiment: {
    score: { type: Number, min: -1, max: 1 },
    label: { type: String, enum: ['positive', 'negative', 'neutral'] },
    keywords: [String],
    analysis: String
  },
  
  // Pattern Recognition Data
  patterns: {
    weeklyPattern: String,
    monthlyPattern: String,
    triggers: [String],
    correlations: [{
      factor: String,
      strength: Number,
      direction: String
    }]
  },
  
  // Streak Tracking
  streaks: {
    positiveStreak: { type: Number, default: 0 },
    trackingStreak: { type: Number, default: 0 },
    improvementStreak: { type: Number, default: 0 },
    recoveryStreak: { type: Number, default: 0 }
  },
  
  // Insights & Recommendations
  insights: [{
    type: { type: String, enum: ['pattern', 'improvement', 'warning', 'achievement', 'recommendation'] },
    message: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    category: { type: String, enum: ['activity', 'social', 'lifestyle', 'therapy', 'general'] },
    actionable: Boolean,
    actionUrl: String
  }],
  
  // Alerts & Notifications
  alerts: [{
    type: { type: String, enum: ['declining_mood', 'streak_break', 'pattern_change', 'crisis', 'improvement'] },
    message: String,
    severity: { type: String, enum: ['info', 'warning', 'alert', 'critical'] },
    triggered: { type: Boolean, default: false },
    acknowledged: { type: Boolean, default: false },
    actionRequired: Boolean
  }],
  
  // Metadata
  entryMethod: {
    type: String,
    enum: ['quick_button', 'mood_wheel', 'voice', 'photo', 'manual'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for optimized queries
moodEntrySchema.index({ userId: 1, createdAt: -1 });
moodEntrySchema.index({ mood: 1 });
moodEntrySchema.index({ intensity: 1 });
moodEntrySchema.index({ timeOfDay: 1 });
moodEntrySchema.index({ activity: 1 });
moodEntrySchema.index({ socialContext: 1 });
moodEntrySchema.index({ 'patterns.triggers': 1 });
moodEntrySchema.index({ 'alerts.triggered': 1 });

// Virtual for formatted mood entry
moodEntrySchema.virtual('formattedEntry').get(function() {
  return `${this.mood.charAt(0).toUpperCase() + this.mood.slice(1)} (${this.intensity}/10)`;
});

// Static method to get user's mood trends
moodEntrySchema.statics.getMoodTrends = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        },
        avgMood: { $avg: { $indexOfArray: [['very_sad', 'sad', 'neutral', 'happy', 'very_happy'], '$mood'] } },
        avgIntensity: { $avg: "$intensity" },
        totalEntries: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return trends;
};

// Static method to get mood patterns
moodEntrySchema.statics.getMoodPatterns = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const patterns = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: "$createdAt" },
          timeOfDay: "$timeOfDay",
          activity: "$activity",
          socialContext: "$socialContext"
        },
        avgMood: { $avg: { $indexOfArray: [['very_sad', 'sad', 'neutral', 'happy', 'very_happy'], '$mood'] } },
        avgIntensity: { $avg: "$intensity" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.dayOfWeek': 1, '_id.timeOfDay': 1 }
    }
  ]);

  return patterns;
};

// Static method to get mood streaks
moodEntrySchema.statics.getMoodStreaks = async function(userId) {
  const entries = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  }).sort({ createdAt: -1 });

  let currentPositiveStreak = 0;
  let currentTrackingStreak = 0;
  let maxPositiveStreak = 0;
  let maxTrackingStreak = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const moodIndex = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(entry.mood);
    
    // Track positive mood streak
    if (moodIndex >= 3) { // happy or very_happy
      currentPositiveStreak++;
      maxPositiveStreak = Math.max(maxPositiveStreak, currentPositiveStreak);
    } else {
      currentPositiveStreak = 0;
    }

    // Track consecutive days of tracking
    if (i === 0) {
      currentTrackingStreak = 1;
    } else {
      const prevEntry = entries[i - 1];
      const daysDiff = Math.floor((entry.createdAt - prevEntry.createdAt) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentTrackingStreak++;
        maxTrackingStreak = Math.max(maxTrackingStreak, currentTrackingStreak);
      } else if (daysDiff > 1) {
        currentTrackingStreak = 1;
      }
    }
  }

  return {
    currentPositiveStreak,
    maxPositiveStreak,
    currentTrackingStreak,
    maxTrackingStreak
  };
};

// Static method to generate insights
moodEntrySchema.statics.generateInsights = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: startDate },
    isActive: true
  }).sort({ createdAt: -1 });

  const insights = [];

  // Analyze patterns
  const patterns = await this.getMoodPatterns(userId, days);
  
  // Find best/worst times
  const timeAnalysis = patterns.filter(p => p._id.timeOfDay);
  if (timeAnalysis.length > 0) {
    const bestTime = timeAnalysis.reduce((a, b) => a.avgMood > b.avgMood ? a : b);
    const worstTime = timeAnalysis.reduce((a, b) => a.avgMood < b.avgMood ? a : b);
    
    insights.push({
      type: 'pattern',
      message: `You tend to feel best during ${bestTime._id.timeOfDay} and worst during ${worstTime._id.timeOfDay}`,
      priority: 'medium',
      category: 'lifestyle',
      actionable: true
    });
  }

  // Analyze activity correlation
  const activityAnalysis = patterns.filter(p => p._id.activity);
  if (activityAnalysis.length > 0) {
    const bestActivity = activityAnalysis.reduce((a, b) => a.avgMood > b.avgMood ? a : b);
    insights.push({
      type: 'recommendation',
      message: `Your mood improves most when you're ${bestActivity._id.activity}`,
      priority: 'high',
      category: 'activity',
      actionable: true
    });
  }

  // Check for declining mood
  const recentEntries = entries.slice(0, 7);
  const olderEntries = entries.slice(7, 14);
  
  if (recentEntries.length >= 3 && olderEntries.length >= 3) {
    const recentAvg = recentEntries.reduce((sum, e) => sum + ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(e.mood), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, e) => sum + ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(e.mood), 0) / olderEntries.length;
    
    if (recentAvg < olderAvg - 0.5) {
      insights.push({
        type: 'warning',
        message: 'Your mood has been declining recently. Consider reaching out for support.',
        priority: 'high',
        category: 'general',
        actionable: true
      });
    }
  }

  return insights;
};

// Ensure virtual fields are serialized
moodEntrySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
