const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for group messages
    index: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'emoji', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String
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
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });
messageSchema.index({ isDeleted: 1, isActive: 1 });

// Static method to get room messages
messageSchema.statics.getRoomMessages = async function(roomId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    roomId,
    isDeleted: false,
    isActive: true
  })
  .populate('senderId', 'name avatar')
  .populate('receiverId', 'name avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get unread messages count
messageSchema.statics.getUnreadCount = async function(userId, roomId) {
  return await this.countDocuments({
    roomId,
    receiverId: userId,
    isRead: false,
    isDeleted: false,
    isActive: true
  });
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function(roomId, userId) {
  return await this.updateMany(
    {
      roomId,
      receiverId: userId,
      isRead: false,
      isDeleted: false,
      isActive: true
    },
    {
      $set: { isRead: true },
      $addToSet: {
        readBy: {
          userId,
          readAt: new Date()
        }
      }
    }
  );
};

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId, reaction) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    userId,
    reaction,
    createdAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to edit message
messageSchema.methods.editMessage = function(newContent) {
  this.edited.originalContent = this.content;
  this.content = newContent;
  this.edited.isEdited = true;
  this.edited.editedAt = new Date();
  return this.save();
};

// Instance method to soft delete message
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Virtual for reaction summary
messageSchema.virtual('reactionSummary').get(function() {
  const summary = {};
  this.reactions.forEach(reaction => {
    summary[reaction.reaction] = (summary[reaction.reaction] || 0) + 1;
  });
  return summary;
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Message', messageSchema);
