const CommunityMessage = require('../models/CommunityMessage');
const Community = require('../models/Community');
const { validationResult } = require('express-validator');

// @desc    Add reaction to message
// @route   POST /api/community/message/:id/reaction
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(message.communityId);
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to react to messages'
      });
    }

    await message.addReaction(req.user.id, reaction);

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      data: message
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction'
    });
  }
};

// @desc    Remove reaction from message
// @route   DELETE /api/community/message/:id/reaction
// @access  Private
exports.removeReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.removeReaction(req.user.id, reaction);

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
      data: message
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing reaction'
    });
  }
};

// @desc    Edit message
// @route   PUT /api/community/message/:id
// @access  Private
exports.editMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { content } = req.body;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Can only edit your own messages'
      });
    }

    // Check if message is too old to edit (e.g., 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (message.createdAt < oneHourAgo) {
      return res.status(400).json({
        success: false,
        message: 'Messages can only be edited within 1 hour of posting'
      });
    }

    await message.editMessage(content);
    await message.populate('senderId', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error editing message'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/community/message/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const community = await Community.findById(message.communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user can delete (sender or moderator)
    const isSender = message.senderId.toString() === req.user.id;
    const isModerator = community.isModerator(req.user.id);

    if (!isSender && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'Can only delete your own messages or must be a moderator'
      });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = req.user.id;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
};

// @desc    Report message
// @route   POST /api/community/message/:id/report
// @access  Private
exports.reportMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { reason, description } = req.body;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(message.communityId);
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to report messages'
      });
    }

    // Check if user is reporting their own message
    if (message.senderId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot report your own message'
      });
    }

    await message.reportMessage(req.user.id, reason, description);

    res.status(200).json({
      success: true,
      message: 'Message reported successfully'
    });
  } catch (error) {
    console.error('Report message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reporting message'
    });
  }
};

// @desc    Moderate message
// @route   POST /api/community/message/:id/moderate
// @access  Private
exports.moderateMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { action, reason } = req.body;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const community = await Community.findById(message.communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is moderator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a moderator to moderate messages'
      });
    }

    await message.moderateMessage(req.user.id, action, reason);

    res.status(200).json({
      success: true,
      message: 'Message moderated successfully',
      data: message
    });
  } catch (error) {
    console.error('Moderate message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error moderating message'
    });
  }
};

// @desc    Pin/Unpin message
// @route   POST /api/community/message/:id/pin
// @access  Private
exports.togglePinMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const community = await Community.findById(message.communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is moderator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a moderator to pin messages'
      });
    }

    await message.togglePin(req.user.id);
    await message.populate('senderId', 'name avatar');
    await message.populate('pinnedBy', 'name avatar');

    res.status(200).json({
      success: true,
      message: message.isPinned ? 'Message pinned successfully' : 'Message unpinned successfully',
      data: message
    });
  } catch (error) {
    console.error('Toggle pin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling pin'
    });
  }
};

// @desc    Vote in poll
// @route   POST /api/community/message/:id/vote
// @access  Private
exports.voteInPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;

    const message = await CommunityMessage.findById(id);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.messageType !== 'poll') {
      return res.status(400).json({
        success: false,
        message: 'This message is not a poll'
      });
    }

    // Check if poll has expired
    if (message.poll.expiresAt && new Date() > message.poll.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This poll has expired'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(message.communityId);
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to vote in polls'
      });
    }

    await message.voteInPoll(req.user.id, optionIndex);

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: message
    });
  } catch (error) {
    console.error('Vote in poll error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error voting in poll'
    });
  }
};

// @desc    Get reported messages
// @route   GET /api/community/:id/reports
// @access  Private
exports.getReportedMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is moderator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a moderator to view reports'
      });
    }

    const messages = await CommunityMessage.getReportedMessages(id, status);
    const total = await CommunityMessage.countDocuments({
      communityId: id,
      'reports.status': status,
      isDeleted: false,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get reported messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reported messages'
    });
  }
};

// @desc    Get pinned messages
// @route   GET /api/community/:id/pinned
// @access  Private
exports.getPinnedMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is member
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to view pinned messages'
      });
    }

    const messages = await CommunityMessage.getPinnedMessages(id);

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get pinned messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving pinned messages'
    });
  }
};

// @desc    Search messages in community
// @route   GET /api/community/:id/search
// @access  Private
exports.searchMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { q, page = 1, limit = 20, messageType } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is member
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to search messages'
      });
    }

    const options = {
      includeModerated: community.isModerator(req.user.id),
      search: q.trim(),
      messageType
    };

    const messages = await CommunityMessage.getCommunityMessages(
      id,
      parseInt(page),
      parseInt(limit),
      options
    );

    const total = await CommunityMessage.countDocuments({
      communityId: id,
      isDeleted: false,
      isActive: true,
      content: { $regex: q.trim(), $options: 'i' },
      ...(options.includeModerated === false && { 'moderation.isModerated': false }),
      ...(messageType && { messageType })
    });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching messages'
    });
  }
}; 