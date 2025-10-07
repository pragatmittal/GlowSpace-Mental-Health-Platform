const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['general', 'anxiety', 'depression', 'stress', 'relationships', 'self-care', 'therapy', 'meditation', 'fitness', 'nutrition'],
    default: 'general'
  },
  type: {
    type: String,
    enum: ['public', 'private', 'moderated'],
    default: 'public'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 1000
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    allowEditing: {
      type: Boolean,
      default: true
    },
    allowDeleting: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ type: 1 });
communitySchema.index({ 'members.userId': 1 });
communitySchema.index({ isActive: 1, isArchived: 1 });
communitySchema.index({ 'stats.lastActivity': -1 });

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.isActive).length;
});

// Static method to get communities by category
communitySchema.statics.getByCategory = async function(category, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    category,
    isActive: true,
    isArchived: false
  })
  .populate('createdBy', 'name avatar')
  .populate('moderators', 'name avatar')
  .sort({ 'stats.lastActivity': -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get user's communities
communitySchema.statics.getUserCommunities = async function(userId) {
  return await this.find({
    $and: [
      { isActive: true, isArchived: false },
      {
        members: {
          $elemMatch: {
            userId: userId,
            isActive: true
          }
        }
      }
    ]
  })
  .populate('createdBy', 'name avatar')
  .populate('moderators', 'name avatar')
  .sort({ 'stats.lastActivity': -1 });
};

// Static method to search communities
communitySchema.statics.search = async function(query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    $and: [
      { isActive: true, isArchived: false },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  })
  .populate('createdBy', 'name avatar')
  .populate('moderators', 'name avatar')
  .sort({ 'stats.lastActivity': -1 })
  .skip(skip)
  .limit(limit);
};

// Method to add member
communitySchema.methods.addMember = async function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.isActive = true;
    existingMember.role = role;
  } else {
    this.members.push({
      userId,
      role,
      isActive: true
    });
  }
  
  this.stats.totalMembers = this.members.filter(m => m.isActive).length;
  await this.save();
  return this;
};

// Method to remove member
communitySchema.methods.removeMember = async function(userId) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (member) {
    member.isActive = false;
    this.stats.totalMembers = this.members.filter(m => m.isActive).length;
    await this.save();
  }
  
  return this;
};

// Method to check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
};

// Method to check if user is moderator
communitySchema.methods.isModerator = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && 
    member.isActive && 
    ['moderator', 'admin'].includes(member.role)
  );
};

// Method to update stats
communitySchema.methods.updateStats = async function() {
  this.stats.totalMembers = this.members.filter(m => m.isActive).length;
  this.stats.lastActivity = new Date();
  await this.save();
  return this;
};

module.exports = mongoose.model('Community', communitySchema); 