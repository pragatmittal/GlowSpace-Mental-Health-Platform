const Community = require('../models/Community');
const CommunityMessage = require('../models/CommunityMessage');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create a new community
// @route   POST /api/community
// @access  Private
exports.createCommunity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, category, type, tags, settings } = req.body;
    console.log('Creating community with data:', { name, description, category, type, tags, settings });

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true 
    });

    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'Community name already exists'
      });
    }

    // Create community
    const community = new Community({
      name,
      description,
      category,
      type,
      tags: tags || [],
      settings: settings || {},
      createdBy: req.user.id,
      moderators: [req.user.id]
    });

    console.log('Created community object:', community);

    // Add creator as admin member
    await community.addMember(req.user.id, 'admin');

    // Populate creator and moderators
    await community.populate('createdBy', 'name avatar');
    await community.populate('moderators', 'name avatar');

    console.log('Sending community response:', {
      success: true,
      message: 'Community created successfully',
      data: {
        _id: community._id,
        name: community.name,
        description: community.description
      }
    });

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: community
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating community'
    });
  }
};

// @desc    Get all communities
// @route   GET /api/community
// @access  Private
exports.getCommunities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      type = 'public',
      sortBy = 'lastActivity'
    } = req.query;

    let query = {
      isActive: true,
      isArchived: false
    };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by type
    if (type !== 'all') {
      query.type = type;
    }

    // Search communities
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'name':
        sort = { name: 1 };
        break;
      case 'members':
        sort = { 'stats.totalMembers': -1 };
        break;
      case 'messages':
        sort = { 'stats.totalMessages': -1 };
        break;
      case 'created':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { 'stats.lastActivity': -1 };
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name avatar')
      .populate('moderators', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Community.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        communities,
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
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving communities'
    });
  }
};

// @desc    Get community by ID
// @route   GET /api/community/:id
// @access  Private
exports.getCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting community with ID:', id);

    // Check if ID is a valid MongoDB ObjectId
    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid community ID format'
      });
    }

    const community = await Community.findById(id)
      .populate('createdBy', 'name avatar')
      .populate('moderators', 'name avatar')
      .populate('members.userId', 'name avatar');

    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is member
    const isMember = community.isMember(req.user.id);
    const isModerator = community.isModerator(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        community,
        userRole: {
          isMember,
          isModerator,
          canJoin: !isMember && community.type === 'public',
          canModerate: isModerator
        }
      }
    });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving community'
    });
  }
};

// @desc    Join community
// @route   POST /api/community/:id/join
// @access  Private
exports.joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is already a member
    if (community.isMember(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this community'
      });
    }

    // Check if community is full
    if (community.members.filter(m => m.isActive).length >= community.settings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Community is full'
      });
    }

    // Check if approval is required
    if (community.settings.requireApproval && community.type === 'moderated') {
      // Add as pending member
      community.members.push({
        userId: req.user.id,
        role: 'member',
        isActive: false
      });
      await community.save();

      return res.status(200).json({
        success: true,
        message: 'Join request sent. Waiting for moderator approval.'
      });
    }

    // Add as active member
    await community.addMember(req.user.id, 'member');

    res.status(200).json({
      success: true,
      message: 'Successfully joined community'
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining community'
    });
  }
};

// @desc    Leave community
// @route   POST /api/community/:id/leave
// @access  Private
exports.leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is a member
    if (!community.isMember(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this community'
      });
    }

    // Check if user is the creator
    if (community.createdBy.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Community creator cannot leave. Transfer ownership first.'
      });
    }

    await community.removeMember(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Successfully left community'
    });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving community'
    });
  }
};

// @desc    Get community messages
// @route   GET /api/community/:id/messages
// @access  Private
exports.getCommunityMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, search, messageType } = req.query;
    console.log('Getting messages for community ID:', id);

    // Check if ID is a valid MongoDB ObjectId
    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid community ID format'
      });
    }

    const community = await Community.findById(id);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is member
    const isMember = community.isMember(req.user.id);
    console.log('User membership check:', { userId: req.user.id, isMember, communityType: community.type });
    
    if (!isMember) {
      // If it's a public community, automatically add the user
      if (community.type === 'public') {
        console.log('Auto-joining user to public community');
        await community.addMember(req.user.id, 'member');
      } else {
        return res.status(403).json({
          success: false,
          message: 'Must be a member to view messages'
        });
      }
    }

    const options = {
      includeModerated: community.isModerator(req.user.id),
      search,
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
      ...(options.includeModerated === false && { 'moderation.isModerated': false })
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
    console.error('Get community messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving messages'
    });
  }
};

// @desc    Send message to community
// @route   POST /api/community/:id/messages
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

    const { id } = req.params;
    const { content, messageType = 'text', attachments, replyTo, poll } = req.body;

    const community = await Community.findById(id);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is member
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to send messages'
      });
    }

    // Validate message type permissions
    if (messageType === 'announcement' && !community.isModerator(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Only moderators can send announcements'
      });
    }

    // Create message
    const messageData = {
      communityId: id,
      senderId: req.user.id,
      content,
      messageType,
      attachments: attachments || []
    };

    // Add reply reference
    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    // Add poll data
    if (messageType === 'poll' && poll) {
      messageData.poll = poll;
    }

    const message = new CommunityMessage(messageData);
    await message.save();

    // Populate sender info
    await message.populate('senderId', 'name avatar');
    if (replyTo) {
      await message.populate('replyTo', 'content senderId');
      await message.populate('replyTo.senderId', 'name avatar');
    }

    // Update community stats
    community.stats.totalMessages += 1;
    community.stats.lastActivity = new Date();
    await community.save();

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

// @desc    Update community
// @route   PUT /api/community/:id
// @access  Private
exports.updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, tags, settings } = req.body;

    const community = await Community.findById(id);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is moderator or creator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Only moderators can update community'
      });
    }

    // Update fields
    if (name) community.name = name;
    if (description) community.description = description;
    if (category) community.category = category;
    if (tags) community.tags = tags;
    if (settings) community.settings = { ...community.settings, ...settings };

    await community.save();

    res.status(200).json({
      success: true,
      message: 'Community updated successfully',
      data: community
    });
  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating community'
    });
  }
};

// @desc    Delete community
// @route   DELETE /api/community/:id
// @access  Private
exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is creator
    if (community.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only creator can delete community'
      });
    }

    // Soft delete
    community.isActive = false;
    community.isArchived = true;
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    console.error('Delete community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting community'
    });
  }
};

// @desc    Get user's communities
// @route   GET /api/community/user/me
// @access  Private
exports.getUserCommunities = async (req, res) => {
  try {
    const communities = await Community.getUserCommunities(req.user.id);

    res.status(200).json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('Get user communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user communities'
    });
  }
};

// @desc    Search communities
// @route   GET /api/community/search
// @access  Private
exports.searchCommunities = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const communities = await Community.search(q.trim(), parseInt(page), parseInt(limit));
    const total = await Community.countDocuments({
      $and: [
        { isActive: true, isArchived: false },
        {
          $or: [
            { name: { $regex: q.trim(), $options: 'i' } },
            { description: { $regex: q.trim(), $options: 'i' } },
            { tags: { $in: [new RegExp(q.trim(), 'i')] } }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        communities,
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
    console.error('Search communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching communities'
    });
  }
};

// @desc    Get community categories
// @route   GET /api/community/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'general', name: 'General', description: 'General mental health discussions' },
      { id: 'anxiety', name: 'Anxiety', description: 'Anxiety and panic disorder support' },
      { id: 'depression', name: 'Depression', description: 'Depression and mood disorders' },
      { id: 'stress', name: 'Stress', description: 'Stress management and coping' },
      { id: 'relationships', name: 'Relationships', description: 'Relationship and social support' },
      { id: 'self-care', name: 'Self-Care', description: 'Self-care and wellness tips' },
      { id: 'therapy', name: 'Therapy', description: 'Therapy and professional help' },
      { id: 'meditation', name: 'Meditation', description: 'Meditation and mindfulness' },
      { id: 'fitness', name: 'Fitness', description: 'Physical fitness and mental health' },
      { id: 'nutrition', name: 'Nutrition', description: 'Nutrition and mental health' }
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving categories'
    });
  }
}; 