const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['trauma', 'medication', 'voice', 'mood', 'anxiety', 'depression', 'stress'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  questions: [{
    id: String,
    question: String,
    type: {
      type: String,
      enum: ['text', 'multiple_choice', 'rating', 'boolean', 'scale']
    },
    options: [String], // For multiple choice
    required: Boolean,
    answer: mongoose.Schema.Types.Mixed
  }],
  responses: {
    textResponses: [{
      questionId: String,
      response: String,
      sentiment: {
        score: Number, // -1 to 1
        label: String, // positive, negative, neutral
        confidence: Number
      },
      keywords: [String],
      analysisMetadata: {
        wordCount: Number,
        readingTime: Number,
        complexity: Number
      }
    }],
    ratings: [{
      questionId: String,
      rating: Number,
      scale: {
        min: Number,
        max: Number,
        labels: {
          low: String,
          high: String
        }
      }
    }],
    multipleChoice: [{
      questionId: String,
      selectedOption: String,
      allOptions: [String]
    }],
    voiceAnalysis: {
      audioUrl: String,
      duration: Number,
      transcript: String,
      emotionalTone: {
        dominant: String,
        confidence: Number,
        breakdown: {
          calm: Number,
          stressed: Number,
          anxious: Number,
          depressed: Number,
          excited: Number
        }
      },
      speechPatterns: {
        pace: Number, // words per minute
        pauseFrequency: Number,
        volumeVariation: Number,
        tonalVariation: Number
      }
    }
  },
  scoring: {
    totalScore: {
      type: Number,
      min: 0,
      max: 100
    },
    subscores: [{
      category: String,
      score: Number,
      maxScore: Number,
      interpretation: String
    }],
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low'
    },
    recommendations: [String],
    followUpRequired: Boolean
  },
  analysis: {
    aiAnalysis: {
      summary: String,
      insights: [String],
      patterns: [String],
      concerns: [String]
    },
    professionalNotes: String,
    flags: [{
      type: String,
      severity: String,
      description: String,
      timestamp: Date
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'reviewed', 'flagged'],
    default: 'draft'
  },
  completedAt: Date,
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
assessmentSchema.index({ userId: 1, type: 1 });
assessmentSchema.index({ status: 1 });
assessmentSchema.index({ 'scoring.riskLevel': 1 });
assessmentSchema.index({ completedAt: -1 });

// Virtual for completion percentage
assessmentSchema.virtual('completionPercentage').get(function() {
  if (!this.questions || this.questions.length === 0) return 0;
  
  const answeredQuestions = this.questions.filter(q => q.answer !== undefined && q.answer !== null);
  return Math.round((answeredQuestions.length / this.questions.length) * 100);
});

// Static method to get user assessment history
assessmentSchema.statics.getUserAssessments = async function(userId, type = null, limit = 10) {
  const query = { userId, isActive: true };
  if (type) query.type = type;
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get assessment analytics
assessmentSchema.statics.getAssessmentAnalytics = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        completedAt: { $gte: startDate },
        status: 'completed',
        isActive: true
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgScore: { $avg: '$scoring.totalScore' },
        lastCompleted: { $max: '$completedAt' },
        riskLevels: { $push: '$scoring.riskLevel' }
      }
    },
    {
      $sort: { lastCompleted: -1 }
    }
  ]);
};

// Instance method to calculate risk score
assessmentSchema.methods.calculateRiskScore = function() {
  const { textResponses, ratings } = this.responses;
  let riskScore = 0;
  
  // Analyze text responses for negative sentiment
  if (textResponses) {
    textResponses.forEach(response => {
      if (response.sentiment && response.sentiment.score < -0.5) {
        riskScore += 10;
      }
    });
  }
  
  // Analyze ratings for concerning patterns
  if (ratings) {
    ratings.forEach(rating => {
      if (rating.rating >= 7) { // Assuming 1-10 scale where high is concerning
        riskScore += 5;
      }
    });
  }
  
  // Set risk level based on score
  if (riskScore >= 30) this.scoring.riskLevel = 'critical';
  else if (riskScore >= 20) this.scoring.riskLevel = 'high';
  else if (riskScore >= 10) this.scoring.riskLevel = 'moderate';
  else this.scoring.riskLevel = 'low';
  
  return riskScore;
};

// Instance method to generate recommendations
assessmentSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  const { riskLevel, totalScore } = this.scoring;
  
  switch (riskLevel) {
    case 'critical':
      recommendations.push('Immediate professional consultation recommended');
      recommendations.push('Consider reaching out to crisis support services');
      recommendations.push('Avoid being alone and seek support from trusted individuals');
      break;
    case 'high':
      recommendations.push('Schedule an appointment with a mental health professional');
      recommendations.push('Consider starting therapy or counseling');
      recommendations.push('Implement stress management techniques');
      break;
    case 'moderate':
      recommendations.push('Regular check-ins with a counselor may be beneficial');
      recommendations.push('Practice mindfulness and relaxation techniques');
      recommendations.push('Maintain healthy lifestyle habits');
      break;
    case 'low':
      recommendations.push('Continue current positive mental health practices');
      recommendations.push('Regular self-assessment and monitoring');
      recommendations.push('Engage in preventive mental health activities');
      break;
  }
  
  // Type-specific recommendations
  if (this.type === 'trauma') {
    recommendations.push('Consider trauma-informed therapy approaches');
    recommendations.push('Practice grounding techniques during difficult moments');
  } else if (this.type === 'anxiety') {
    recommendations.push('Try breathing exercises and meditation');
    recommendations.push('Regular exercise can help manage anxiety symptoms');
  } else if (this.type === 'depression') {
    recommendations.push('Maintain social connections and support networks');
    recommendations.push('Consider light therapy or outdoor activities');
  }
  
  this.scoring.recommendations = recommendations;
  return recommendations;
};

// Pre-save middleware to calculate scores and generate recommendations
assessmentSchema.pre('save', function(next) {
  if (this.isModified('responses') || this.isModified('status')) {
    if (this.status === 'completed') {
      this.calculateRiskScore();
      this.generateRecommendations();
      
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    }
  }
  next();
});

// Ensure virtual fields are serialized
assessmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
