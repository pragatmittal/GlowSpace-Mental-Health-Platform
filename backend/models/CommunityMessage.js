const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'emoji', 'system', 'announcement', 'poll'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    thumbnail: String
  }],
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String,
    editCount: {
      type: Number,
      default: 0
    }
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: String, // emoji
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderation: {
    isModerated: {
      type: Boolean,
      default: false
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationReason: String,
    moderationAction: {
      type: String,
      enum: ['warn', 'hide', 'delete', 'ban'],
      default: 'warn'
    }
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other'],
      required: true
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  }],
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    expiresAt: Date,
    allowMultipleVotes: {
      type: Boolean,
      default: false
    }
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedAt: Date,
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityMessage'
  },
  thread: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityMessage'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
communityMessageSchema.index({ communityId: 1, createdAt: -1 });
communityMessageSchema.index({ senderId: 1, createdAt: -1 });
communityMessageSchema.index({ 'moderation.isModerated': 1 });
communityMessageSchema.index({ 'reports.status': 1 });
communityMessageSchema.index({ isDeleted: 1, isActive: 1 });
communityMessageSchema.index({ isPinned: 1 });
communityMessageSchema.index({ replyTo: 1 });

// Static method to get community messages
communityMessageSchema.statics.getCommunityMessages = async function(communityId, page = 1, limit = 50, options = {}) {
  const skip = (page - 1) * limit;
  
  let query = {
    communityId,
    isDeleted: false,
    isActive: true
  };

  // Filter by moderation status
  if (options.includeModerated === false) {
    query['moderation.isModerated'] = false;
  }

  // Filter by message type
  if (options.messageType) {
    query.messageType = options.messageType;
  }

  // Filter by sender
  if (options.senderId) {
    query.senderId = options.senderId;
  }

  // Search in content
  if (options.search) {
    query.content = { $regex: options.search, $options: 'i' };
  }

  return await this.find(query)
    .populate('senderId', 'name avatar')
    .populate('moderation.moderatedBy', 'name avatar')
    .populate('replyTo', 'content senderId')
    .populate('replyTo.senderId', 'name avatar')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get pinned messages
communityMessageSchema.statics.getPinnedMessages = async function(communityId) {
  return await this.find({
    communityId,
    isPinned: true,
    isDeleted: false,
    isActive: true
  })
  .populate('senderId', 'name avatar')
  .populate('pinnedBy', 'name avatar')
  .sort({ pinnedAt: -1 });
};

// Static method to get reported messages
communityMessageSchema.statics.getReportedMessages = async function(communityId, status = 'pending') {
  return await this.find({
    communityId,
    'reports.status': status,
    isDeleted: false,
    isActive: true
  })
  .populate('senderId', 'name avatar')
  .populate('reports.reportedBy', 'name avatar')
  .populate('reports.reviewedBy', 'name avatar')
  .sort({ 'reports.reportedAt': -1 });
};

// Method to add reaction
communityMessageSchema.methods.addReaction = async function(userId, reaction) {
  const existingReaction = this.reactions.find(r => 
    r.userId.toString() === userId.toString() && r.reaction === reaction
  );
  
  if (!existingReaction) {
    this.reactions.push({
      userId,
      reaction
    });
    await this.save();
  }
  
  return this;
};

// Method to remove reaction
communityMessageSchema.methods.removeReaction = async function(userId, reaction) {
  this.reactions = this.reactions.filter(r => 
    !(r.userId.toString() === userId.toString() && r.reaction === reaction)
  );
  await this.save();
  return this;
};

// Method to report message
communityMessageSchema.methods.reportMessage = async function(userId, reason, description = '') {
  const existingReport = this.reports.find(r => 
    r.reportedBy.toString() === userId.toString() && r.status === 'pending'
  );
  
  if (!existingReport) {
    this.reports.push({
      reportedBy: userId,
      reason,
      description
    });
    await this.save();
  }
  
  return this;
};

// Method to moderate message
communityMessageSchema.methods.moderateMessage = async function(moderatorId, action, reason) {
  this.moderation = {
    isModerated: true,
    moderatedBy: moderatorId,
    moderatedAt: new Date(),
    moderationReason: reason,
    moderationAction: action
  };
  
  if (action === 'delete') {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = moderatorId;
  }
  
  await this.save();
  return this;
};

// Method to pin/unpin message
communityMessageSchema.methods.togglePin = async function(userId) {
  this.isPinned = !this.isPinned;
  if (this.isPinned) {
    this.pinnedBy = userId;
    this.pinnedAt = new Date();
  } else {
    this.pinnedBy = null;
    this.pinnedAt = null;
  }
  await this.save();
  return this;
};

// Method to edit message
communityMessageSchema.methods.editMessage = async function(newContent) {
  if (!this.edited.isEdited) {
    this.edited.originalContent = this.content;
  }
  
  this.content = newContent;
  this.edited.isEdited = true;
  this.edited.editedAt = new Date();
  this.edited.editCount += 1;
  
  await this.save();
  return this;
};

// Method to vote in poll
communityMessageSchema.methods.voteInPoll = async function(userId, optionIndex) {
  if (this.messageType !== 'poll' || !this.poll) {
    throw new Error('This message is not a poll');
  }
  
  if (optionIndex < 0 || optionIndex >= this.poll.options.length) {
    throw new Error('Invalid option index');
  }
  
  const option = this.poll.options[optionIndex];
  const existingVote = option.votes.find(v => v.userId.toString() === userId.toString());
  
  if (!this.poll.allowMultipleVotes && existingVote) {
    throw new Error('Already voted in this poll');
  }
  
  if (!existingVote) {
    option.votes.push({ userId });
    await this.save();
  }
  
  return this;
};

module.exports = mongoose.model('CommunityMessage', communityMessageSchema); 