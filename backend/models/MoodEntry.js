const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [String],
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
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          mood: "$mood"
        },
        count: { $sum: 1 },
        avgIntensity: { $avg: "$intensity" }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        moods: {
          $push: {
            mood: "$_id.mood",
            count: "$count",
            avgIntensity: "$avgIntensity"
          }
        },
        totalEntries: { $sum: "$count" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return trends;
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
