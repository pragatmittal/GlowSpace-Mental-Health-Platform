const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Goal description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Goal category is required'],
    enum: ['mindfulness', 'physical', 'emotional', 'social', 'productivity', 'learning', 'other'],
    default: 'other'
  },
  targetValue: {
    type: Number,
    required: [true, 'Target value is required'],
    min: [1, 'Target value must be at least 1']
  },
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Current value cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    maxlength: [20, 'Unit cannot exceed 20 characters']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  streak: {
    type: Number,
    default: 0,
    min: [0, 'Streak cannot be negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, endDate: 1 });
goalSchema.index({ userId: 1, category: 1 });

// Instance method to update progress
goalSchema.methods.updateProgress = async function(increment = 1) {
  const oldValue = this.currentValue;
  this.currentValue = Math.min(this.currentValue + increment, this.targetValue);
  
  // Update streak if progress was made
  if (this.currentValue > oldValue) {
    this.streak += 1;
  }
  
  // Check if goal is completed
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
  }
  
  this.lastUpdated = new Date();
  return await this.save();
};

// Instance method to reset progress
goalSchema.methods.resetProgress = async function() {
  this.currentValue = 0;
  this.streak = 0;
  this.status = 'active';
  this.lastUpdated = new Date();
  return await this.save();
};

// Static method to get user goals
goalSchema.statics.getUserGoals = async function(userId, status = null) {
  const query = { userId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email');
};

// Static method to get goals summary
goalSchema.statics.getGoalsSummary = async function(userId) {
  const goals = await this.find({ userId, isActive: true });
  
  const summary = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    paused: goals.filter(g => g.status === 'paused').length,
    cancelled: goals.filter(g => g.status === 'cancelled').length,
    categories: {},
    averageProgress: 0
  };
  
  // Calculate category distribution
  goals.forEach(goal => {
    if (!summary.categories[goal.category]) {
      summary.categories[goal.category] = 0;
    }
    summary.categories[goal.category]++;
  });
  
  // Calculate average progress
  if (goals.length > 0) {
    const totalProgress = goals.reduce((sum, goal) => {
      return sum + (goal.currentValue / goal.targetValue);
    }, 0);
    summary.averageProgress = (totalProgress / goals.length) * 100;
  }
  
  return summary;
};

// Static method to get expired goals
goalSchema.statics.getExpiredGoals = async function(userId) {
  return await this.find({
    userId,
    isActive: true,
    status: 'active',
    endDate: { $lt: new Date() }
  });
};

// Pre-save middleware to validate dates
goalSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  if (this.currentValue > this.targetValue) {
    this.currentValue = this.targetValue;
  }
  
  next();
});

module.exports = mongoose.model('Goal', goalSchema); 