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
  
  // Inspirational Quote
  quote: {
    text: String,
    author: String
  },
  
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

  // First try to get aggregated trends
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
        avgMood: { $avg: { $add: [{ $indexOfArray: [['very_sad', 'sad', 'neutral', 'happy', 'very_happy'], '$mood'] }, 1] } },
        avgIntensity: { $avg: "$intensity" },
        totalEntries: { $sum: 1 },
        moodEntries: { 
          $push: {
            mood: "$mood",
            intensity: "$intensity",
            timeOfDay: "$timeOfDay",
            activity: "$activity",
            createdAt: "$createdAt"
          }
        }
      }
    },
    {
      $sort: { "_id.date": 1 }
    },
    {
      $project: {
        date: "$_id.date",
        avgMood: 1,
        avgIntensity: 1,
        totalEntries: 1,
        moodEntries: 1,
        _id: 0
      }
    }
  ]);

  // If no trends found, get individual entries as fallback
  if (trends.length === 0) {
    const individualEntries = await this.find({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: startDate },
      isActive: true
    })
    .select('mood intensity timeOfDay activity createdAt')
    .sort({ createdAt: -1 })
    .lean();

    // Transform individual entries to trends format
    const groupedByDate = {};
    individualEntries.forEach(entry => {
      const date = entry.createdAt.toISOString().split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          moodEntries: [],
          totalEntries: 0,
          moodSum: 0,
          intensitySum: 0
        };
      }
      groupedByDate[date].moodEntries.push(entry);
      groupedByDate[date].totalEntries++;
      groupedByDate[date].moodSum += ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(entry.mood) + 1;
      groupedByDate[date].intensitySum += entry.intensity;
    });

    return Object.values(groupedByDate).map(day => ({
      date: day.date,
      avgMood: day.totalEntries > 0 ? day.moodSum / day.totalEntries : 0,
      avgIntensity: day.totalEntries > 0 ? day.intensitySum / day.totalEntries : 0,
      totalEntries: day.totalEntries,
      moodEntries: day.moodEntries
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return trends;
};

// Static method to get recent mood entries for dashboard
moodEntrySchema.statics.getRecentMoodEntries = async function(userId, limit = 10) {
  const entries = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  })
  .select('mood intensity timeOfDay activity createdAt notes')
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();

  return entries.map(entry => ({
    ...entry,
    moodValue: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(entry.mood) + 1,
    formattedDate: entry.createdAt.toLocaleDateString(),
    formattedTime: entry.createdAt.toLocaleTimeString()
  }));
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

  if (entries.length === 0) {
    return {
      currentPositiveStreak: 0,
      maxPositiveStreak: 0,
      currentTrackingStreak: 0,
      maxTrackingStreak: 0
    };
  }

  // Group entries by day and get the best mood for each day
  const dailyMoods = {};
  entries.forEach(entry => {
    const dayKey = entry.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!dailyMoods[dayKey]) {
      dailyMoods[dayKey] = {
        date: dayKey,
        mood: entry.mood,
        createdAt: entry.createdAt
      };
    } else {
      // If we already have an entry for this day, keep the better mood
      // Priority: very_happy > happy > neutral > sad > very_sad
      const moodPriority = {
        'very_happy': 5,
        'happy': 4,
        'neutral': 3,
        'sad': 2,
        'very_sad': 1
      };
      
      if (moodPriority[entry.mood] > moodPriority[dailyMoods[dayKey].mood]) {
        dailyMoods[dayKey].mood = entry.mood;
        dailyMoods[dayKey].createdAt = entry.createdAt;
      }
    }
  });

  // Convert to array and sort by date (most recent first)
  const dailyMoodArray = Object.values(dailyMoods).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (dailyMoodArray.length === 0) {
    return {
      currentPositiveStreak: 0,
      maxPositiveStreak: 0,
      currentTrackingStreak: 0,
      maxTrackingStreak: 0
    };
  }

  let currentPositiveStreak = 0;
  let currentTrackingStreak = 0;
  let maxPositiveStreak = 0;
  let maxTrackingStreak = 0;

  // Start with the most recent day
  const firstMoodIndex = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(dailyMoodArray[0].mood);
  
  // Initialize streaks based on the most recent day
  currentTrackingStreak = 1;
  maxTrackingStreak = 1;
  
  if (firstMoodIndex >= 3) { // happy or very_happy
    currentPositiveStreak = 1;
    maxPositiveStreak = 1;
  }

  // Check for consecutive days going backwards from most recent
  for (let i = 1; i < dailyMoodArray.length; i++) {
    const currentDay = dailyMoodArray[i];
    const prevDay = dailyMoodArray[i - 1];
    const moodIndex = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].indexOf(currentDay.mood);
    
    // Calculate days difference (prevDay is more recent, currentDay is older)
    const prevDate = new Date(prevDay.date);
    const currentDate = new Date(currentDay.date);
    const daysDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
    
    // If days are consecutive (difference of 1 day)
    if (daysDiff === 1) {
      // Increment tracking streak for consecutive days
      currentTrackingStreak++;
      maxTrackingStreak = Math.max(maxTrackingStreak, currentTrackingStreak);
      
      // Check if this day has positive mood
      if (moodIndex >= 3) { // happy or very_happy
        currentPositiveStreak++;
        maxPositiveStreak = Math.max(maxPositiveStreak, currentPositiveStreak);
      } else {
        // Reset positive streak if mood is not positive
        currentPositiveStreak = 0;
      }
    } else {
      // There's a gap, so streaks are broken
      // Reset to 1 if this day has positive mood, 0 otherwise
      currentPositiveStreak = moodIndex >= 3 ? 1 : 0;
      currentTrackingStreak = 1;
    }
  }

  // Debug logging
  console.log('🔍 Streak Calculation Debug:', {
    totalEntries: entries.length,
    dailyMoods: Object.keys(dailyMoods).length,
    dailyMoodArray: dailyMoodArray.map(day => ({ date: day.date, mood: day.mood })),
    currentPositiveStreak,
    maxPositiveStreak,
    currentTrackingStreak,
    maxTrackingStreak
  });

  return {
    currentPositiveStreak,
    maxPositiveStreak,
    currentTrackingStreak,
    maxTrackingStreak
  };
};

// Static method to calculate weekly mood change
moodEntrySchema.statics.getWeeklyMoodChange = async function(userId) {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  currentWeekStart.setHours(0, 0, 0, 0);
  
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);
  
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setMilliseconds(-1);

  // Get current week entries
  const currentWeekEntries = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
    createdAt: {
      $gte: currentWeekStart,
      $lte: now
    }
  });

  // Get previous week entries
  const previousWeekEntries = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
    createdAt: {
      $gte: previousWeekStart,
      $lt: currentWeekStart
    }
  });

  // Calculate average mood for current week
  let currentWeekAvg = 0;
  if (currentWeekEntries.length > 0) {
    const moodValues = {
      'very_sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very_happy': 5
    };
    
    const totalMoodValue = currentWeekEntries.reduce((sum, entry) => {
      return sum + (moodValues[entry.mood] || 3);
    }, 0);
    
    currentWeekAvg = totalMoodValue / currentWeekEntries.length;
  }

  // Calculate average mood for previous week
  let previousWeekAvg = 0;
  if (previousWeekEntries.length > 0) {
    const moodValues = {
      'very_sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very_happy': 5
    };
    
    const totalMoodValue = previousWeekEntries.reduce((sum, entry) => {
      return sum + (moodValues[entry.mood] || 3);
    }, 0);
    
    previousWeekAvg = totalMoodValue / previousWeekEntries.length;
  }

  // Calculate percentage change
  let percentageChange = 0;
  let changeDirection = 'stable';
  let changeDescription = 'No change';
  
  if (previousWeekAvg > 0) {
    percentageChange = ((currentWeekAvg - previousWeekAvg) / previousWeekAvg) * 100;
    
    if (percentageChange > 5) {
      changeDirection = 'improving';
      changeDescription = 'Improving';
    } else if (percentageChange < -5) {
      changeDirection = 'declining';
      changeDescription = 'Declining';
    } else {
      changeDirection = 'stable';
      changeDescription = 'Stable';
    }
  } else if (currentWeekAvg > 0) {
    // If no previous week data but current week has data
    percentageChange = 100;
    changeDirection = 'improving';
    changeDescription = 'New tracking';
  }

  return {
    currentWeekAvg: Math.round(currentWeekAvg * 10) / 10,
    previousWeekAvg: Math.round(previousWeekAvg * 10) / 10,
    percentageChange: Math.round(percentageChange * 10) / 10,
    changeDirection,
    changeDescription,
    currentWeekEntries: currentWeekEntries.length,
    previousWeekEntries: previousWeekEntries.length,
    currentWeekStart: currentWeekStart.toISOString().split('T')[0],
    previousWeekStart: previousWeekStart.toISOString().split('T')[0]
  };
};

// Static method to generate personalized activity suggestions
moodEntrySchema.statics.getPersonalizedActivitySuggestions = async function(userId) {
  // Get recent mood entries to analyze patterns
  const recentEntries = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  }).sort({ createdAt: -1 }).limit(30);

  if (recentEntries.length === 0) {
    return {
      suggestions: [
        {
          type: 'community',
          title: 'Join Our Community',
          description: 'Connect with others on similar wellness journeys',
          icon: '🤝',
          action: 'Join Community Chat',
          link: '/community',
          priority: 'high',
          reason: 'Start your wellness journey with community support'
        },
        {
          type: 'challenge',
          title: '7-Day Mood Tracking Challenge',
          description: 'Build a consistent mood tracking habit',
          icon: '🎯',
          action: 'Start Challenge',
          link: '/challenges/7-day-mood',
          priority: 'high',
          reason: 'Establish a foundation for better mental health'
        }
      ],
      moodPattern: 'new_user',
      confidence: 0.8
    };
  }

  // Analyze mood patterns
  const moodCounts = {
    'very_sad': 0,
    'sad': 0,
    'neutral': 0,
    'happy': 0,
    'very_happy': 0
  };

  recentEntries.forEach(entry => {
    moodCounts[entry.mood]++;
  });

  const totalEntries = recentEntries.length;
  const positiveMoods = moodCounts['happy'] + moodCounts['very_happy'];
  const negativeMoods = moodCounts['very_sad'] + moodCounts['sad'];
  const neutralMoods = moodCounts['neutral'];

  const positivePercentage = (positiveMoods / totalEntries) * 100;
  const negativePercentage = (negativeMoods / totalEntries) * 100;
  const neutralPercentage = (neutralMoods / totalEntries) * 100;

  // Determine mood pattern
  let moodPattern = 'balanced';
  let suggestions = [];

  if (negativePercentage > 50) {
    moodPattern = 'struggling';
    suggestions = [
      {
        type: 'professional',
        title: 'Professional Consultation',
        description: 'Connect with a mental health professional for personalized support',
        icon: '👩‍⚕️',
        action: 'Book Consultation',
        link: '/appointments',
        priority: 'critical',
        reason: 'Professional support can help during difficult times'
      },
      {
        type: 'community',
        title: 'Support Community',
        description: 'Join our supportive community to share experiences',
        icon: '🤝',
        action: 'Join Community',
        link: '/community',
        priority: 'high',
        reason: 'Connect with others who understand your journey'
      },
      {
        type: 'meditation',
        title: 'Guided Meditation',
        description: 'Practice mindfulness to help manage difficult emotions',
        icon: '🧘‍♀️',
        action: 'Start Meditation',
        link: '/meditation',
        priority: 'high',
        reason: 'Meditation can help reduce stress and improve mood'
      }
    ];
  } else if (positivePercentage > 60) {
    moodPattern = 'thriving';
    suggestions = [
      {
        type: 'challenge',
        title: '21-Day Wellness Challenge',
        description: 'Take your wellness journey to the next level',
        icon: '🌟',
        action: 'Start Challenge',
        link: '/challenges/21-day-wellness',
        priority: 'medium',
        reason: 'Build on your positive momentum with advanced challenges'
      },
      {
        type: 'community',
        title: 'Share Your Success',
        description: 'Inspire others by sharing your wellness journey',
        icon: '💬',
        action: 'Share Story',
        link: '/community',
        priority: 'medium',
        reason: 'Your positive experience can help others'
      },
      {
        type: 'assessment',
        title: 'Mental Health Assessment',
        description: 'Get a comprehensive evaluation of your mental wellness',
        icon: '🧠',
        action: 'Take Assessment',
        link: '/assessments',
        priority: 'low',
        reason: 'Regular assessments help maintain optimal mental health'
      }
    ];
  } else if (neutralPercentage > 40) {
    moodPattern = 'stable';
    suggestions = [
      {
        type: 'challenge',
        title: '14-Day Mood Boost Challenge',
        description: 'Add more positivity to your daily routine',
        icon: '📈',
        action: 'Start Challenge',
        link: '/challenges/14-day-mood-boost',
        priority: 'medium',
        reason: 'Stable mood is great - let\'s add more joy to your days'
      },
      {
        type: 'community',
        title: 'Community Engagement',
        description: 'Connect with others and share experiences',
        icon: '💬',
        action: 'Join Discussion',
        link: '/community',
        priority: 'medium',
        reason: 'Social connection can enhance your stable mood'
      },
      {
        type: 'meditation',
        title: 'Mindfulness Practice',
        description: 'Deepen your awareness and emotional intelligence',
        icon: '🧘‍♂️',
        action: 'Practice Now',
        link: '/meditation',
        priority: 'low',
        reason: 'Mindfulness can help you appreciate your stable state'
      }
    ];
  } else {
    moodPattern = 'mixed';
    suggestions = [
      {
        type: 'challenge',
        title: '7-Day Emotional Balance Challenge',
        description: 'Learn to navigate emotional ups and downs',
        icon: '⚖️',
        action: 'Start Challenge',
        link: '/challenges/7-day-balance',
        priority: 'high',
        reason: 'Help stabilize your emotional patterns'
      },
      {
        type: 'community',
        title: 'Peer Support Group',
        description: 'Connect with others experiencing similar emotional patterns',
        icon: '🤗',
        action: 'Join Group',
        link: '/community',
        priority: 'high',
        reason: 'Support from others can help during emotional fluctuations'
      },
      {
        type: 'meditation',
        title: 'Emotional Regulation Meditation',
        description: 'Learn techniques to manage emotional changes',
        icon: '🌊',
        action: 'Start Practice',
        link: '/meditation',
        priority: 'medium',
        reason: 'Meditation can help you ride emotional waves more smoothly'
      }
    ];
  }

  // Add general suggestions based on activity patterns
  const activityCounts = {};
  recentEntries.forEach(entry => {
    activityCounts[entry.activity] = (activityCounts[entry.activity] || 0) + 1;
  });

  // If user hasn't tried community features, suggest them
  if (!activityCounts['social'] || activityCounts['social'] < 3) {
    suggestions.push({
      type: 'community',
      title: 'Try Community Chat',
      description: 'Connect with others who share similar experiences',
      icon: '💬',
      action: 'Start Chatting',
      link: '/community',
      priority: 'medium',
      reason: 'Social connection is important for mental wellness'
    });
  }

  // If user hasn't tried meditation, suggest it
  if (!activityCounts['relaxation'] || activityCounts['relaxation'] < 2) {
    suggestions.push({
      type: 'meditation',
      title: 'Guided Meditation',
      description: 'Try our mindfulness and meditation sessions',
      icon: '🧘‍♀️',
      action: 'Begin Meditation',
      link: '/meditation',
      priority: 'medium',
      reason: 'Meditation can significantly improve mental wellness'
    });
  }

  // Sort suggestions by priority
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top 3 suggestions
  return {
    suggestions: suggestions.slice(0, 3),
    moodPattern,
    confidence: 0.9,
    analysis: {
      totalEntries,
      positivePercentage: Math.round(positivePercentage),
      negativePercentage: Math.round(negativePercentage),
      neutralPercentage: Math.round(neutralPercentage)
    }
  };
};

// Static method to calculate tracking consistency
moodEntrySchema.statics.getTrackingConsistency = async function(userId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all entries within the time range
  const entries = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: 1 });

  if (entries.length === 0) {
    return {
      consistencyScore: 0,
      daysTracked: 0,
      totalDays: days,
      trackingPattern: 'none'
    };
  }

  // Group entries by day
  const dailyEntries = {};
  entries.forEach(entry => {
    const dayKey = entry.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
    if (!dailyEntries[dayKey]) {
      dailyEntries[dayKey] = [];
    }
    dailyEntries[dayKey].push(entry);
  });

  const daysTracked = Object.keys(dailyEntries).length;
  const consistencyScore = Math.round((daysTracked / days) * 100);

  // Determine tracking pattern
  let trackingPattern = 'irregular';
  if (consistencyScore >= 90) {
    trackingPattern = 'excellent';
  } else if (consistencyScore >= 70) {
    trackingPattern = 'good';
  } else if (consistencyScore >= 50) {
    trackingPattern = 'moderate';
  } else if (consistencyScore >= 30) {
    trackingPattern = 'poor';
  } else {
    trackingPattern = 'very_poor';
  }

  return {
    consistencyScore,
    daysTracked,
    totalDays: days,
    trackingPattern,
    dailyEntries: Object.keys(dailyEntries).length
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
