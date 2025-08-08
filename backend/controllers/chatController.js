const Message = require('../models/Message');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, roomId, receiverId, messageType = 'text' } = req.body;

    // Create message
    const message = new Message({
      senderId: req.user.id,
      receiverId: receiverId || null,
      roomId,
      content,
      messageType
    });

    await message.save();

    // Populate sender info
    await message.populate('senderId', 'name avatar');
    if (receiverId) {
      await message.populate('receiverId', 'name avatar');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// @desc    Get messages for a room
// @route   GET /api/chat/room/:roomId
// @access  Private
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.getRoomMessages(roomId, parseInt(page), parseInt(limit));

    // Reverse to get chronological order
    const reversedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      data: {
        messages: reversedMessages,
        pagination: {
          currentPage: parseInt(page),
          hasNextPage: messages.length === parseInt(limit),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving messages'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/room/:roomId/read
// @access  Private
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    await Message.markAsRead(roomId, userId);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read'
    });
  }
};

// @desc    Get unread messages count
// @route   GET /api/chat/unread/:roomId
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const count = await Message.getUnreadCount(userId, roomId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting unread count'
    });
  }
};

// @desc    Edit a message
// @route   PUT /api/chat/message/:messageId
// @access  Private
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
      _id: messageId,
      senderId: req.user.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or not authorized'
      });
    }

    // Check if message is too old to edit (e.g., 5 minutes)
    const editTimeLimit = 5 * 60 * 1000; // 5 minutes
    if (Date.now() - message.createdAt.getTime() > editTimeLimit) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit'
      });
    }

    await message.editMessage(content);
    await message.populate('senderId', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
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

// @desc    Delete a message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      senderId: req.user.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or not authorized'
      });
    }

    await message.softDelete();

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

// @desc    Add reaction to a message
// @route   POST /api/chat/message/:messageId/reaction
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;

    const message = await Message.findOne({
      _id: messageId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(req.user.id, reaction);

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      data: message.reactionSummary
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction'
    });
  }
};

// @desc    Remove reaction from a message
// @route   DELETE /api/chat/message/:messageId/reaction
// @access  Private
exports.removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.removeReaction(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
      data: message.reactionSummary
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing reaction'
    });
  }
};

// @desc    Get user's chat rooms
// @route   GET /api/chat/rooms
// @access  Private
exports.getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get rooms where user has sent or received messages
    const rooms = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ],
          isDeleted: false,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$createdAt' },
          lastMessageType: { $last: '$messageType' },
          lastSenderId: { $last: '$senderId' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);

    // Populate sender information for last message
    const populatedRooms = await Message.populate(rooms, {
      path: 'lastSenderId',
      select: 'name avatar'
    });

    res.status(200).json({
      success: true,
      data: { rooms: populatedRooms }
    });
  } catch (error) {
    console.error('Get user chat rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat rooms'
    });
  }
};

// @desc    Get online users for chat
// @route   GET /api/chat/online-users
// @access  Private
exports.getOnlineUsers = async (req, res) => {
  try {
    // This would typically integrate with Socket.IO to get real-time online users
    // For now, we'll return users who have been active recently
    const recentlyActive = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

    const onlineUsers = await User.find({
      lastLogin: { $gte: recentlyActive },
      isActive: true,
      _id: { $ne: req.user.id } // Exclude current user
    }).select('name avatar lastLogin').limit(50);

    res.status(200).json({
      success: true,
      data: { users: onlineUsers }
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving online users'
    });
  }
};

// @desc    Search messages
// @route   GET /api/chat/search
// @access  Private
exports.searchMessages = async (req, res) => {
  try {
    const { query, roomId } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchFilter = {
      content: { $regex: query, $options: 'i' },
      isDeleted: false,
      isActive: true,
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    };

    if (roomId) {
      searchFilter.roomId = roomId;
    }

    const messages = await Message.find(searchFilter)
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching messages'
    });
  }
};

// @desc    Get chat statistics
// @route   GET /api/chat/stats
// @access  Private
exports.getChatStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ],
          isDeleted: false,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          messagesSent: {
            $sum: {
              $cond: [{ $eq: ['$senderId', userId] }, 1, 0]
            }
          },
          messagesReceived: {
            $sum: {
              $cond: [{ $eq: ['$receiverId', userId] }, 1, 0]
            }
          },
          uniqueRooms: { $addToSet: '$roomId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalMessages: 1,
          messagesSent: 1,
          messagesReceived: 1,
          uniqueRoomsCount: { $size: '$uniqueRooms' }
        }
      }
    ]);

    const result = stats[0] || {
      totalMessages: 0,
      messagesSent: 0,
      messagesReceived: 0,
      uniqueRoomsCount: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat statistics'
    });
  }
};
