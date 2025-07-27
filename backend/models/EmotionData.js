const mongoose = require('mongoose');

const emotionDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  emotions: {
    happy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    sad: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    angry: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    fearful: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    disgusted: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    surprised: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    neutral: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  dominantEmotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  wellnessScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    deviceInfo: String,
    frameRate: Number,
    resolution: String,
    browserInfo: String,
    platform: String
  },
  contextualData: {
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    location: String,
    activity: String,
    notes: String,
    tags: [String]
  },
  analysis: {
    emotionShifts: [{
      from: String,
      to: String,
      timestamp: Date
    }],
    intensityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    variabilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendations: [{
      type: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      category: {
        type: String,
        enum: ['activity', 'therapy', 'lifestyle', 'social']
    }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
emotionDataSchema.index({ userId: 1, createdAt: -1 });
emotionDataSchema.index({ sessionId: 1, createdAt: 1 });
emotionDataSchema.index({ dominantEmotion: 1, createdAt: -1 });
emotionDataSchema.index({ wellnessScore: 1 });

// Calculate emotion variability
emotionDataSchema.methods.calculateVariability = function() {
  const emotions = Object.values(this.emotions);
  const mean = emotions.reduce((a, b) => a + b, 0) / emotions.length;
  const variance = emotions.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / emotions.length;
  return Math.sqrt(variance);
};

// Get emotion intensity
emotionDataSchema.methods.calculateIntensity = function() {
  const maxEmotion = Math.max(...Object.values(this.emotions));
  const avgEmotion = Object.values(this.emotions).reduce((a, b) => a + b, 0) / 7;
  return (maxEmotion + avgEmotion) / 2;
};

// Generate recommendations based on emotion patterns
emotionDataSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  const { emotions, wellnessScore } = this;

  // Check for high negative emotions
  if (emotions.sad > 70 || emotions.angry > 70 || emotions.fearful > 70) {
    recommendations.push({
      type: 'Consider scheduling a therapy session',
      priority: 'high',
      category: 'therapy'
    });
  }

  // Check for stress patterns
  if (emotions.anxious > 60 && emotions.fearful > 50) {
    recommendations.push({
      type: 'Try stress-reduction exercises',
      priority: 'medium',
      category: 'lifestyle'
    });
  }

  // Check wellness score
  if (wellnessScore < 50) {
    recommendations.push({
      type: 'Join a support group session',
      priority: 'medium',
      category: 'social'
    });
  }

  return recommendations;
};

// Static method to get emotion trends
emotionDataSchema.statics.getEmotionTrends = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
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
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          emotion: '$dominantEmotion'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        avgWellnessScore: { $avg: '$wellnessScore' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        emotions: {
          $push: {
            emotion: '$_id.emotion',
            count: '$count',
            avgConfidence: '$avgConfidence'
          }
        },
        wellnessScore: { $avg: '$avgWellnessScore' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Get emotion patterns by time of day
emotionDataSchema.statics.getTimePatterns = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
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
          timeOfDay: '$contextualData.timeOfDay',
          emotion: '$dominantEmotion'
        },
        count: { $sum: 1 },
        avgWellnessScore: { $avg: '$wellnessScore' }
      }
    },
    {
      $group: {
        _id: '$_id.timeOfDay',
        emotions: {
          $push: {
            emotion: '$_id.emotion',
            count: '$count'
          }
        },
        avgWellnessScore: { $avg: '$avgWellnessScore' }
      }
    }
  ]);
};

// Get emotion correlations with activities
emotionDataSchema.statics.getActivityCorrelations = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
        isActive: true,
        'contextualData.activity': { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          activity: '$contextualData.activity',
          emotion: '$dominantEmotion'
        },
        count: { $sum: 1 },
        avgWellnessScore: { $avg: '$wellnessScore' }
      }
    },
    {
      $group: {
        _id: '$_id.activity',
        emotions: {
          $push: {
            emotion: '$_id.emotion',
            count: '$count'
          }
        },
        avgWellnessScore: { $avg: '$avgWellnessScore' }
  }
    }
  ]);
};

module.exports = mongoose.model('EmotionData', emotionDataSchema);
