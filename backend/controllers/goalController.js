const Goal = require('../models/Goal');

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetValue,
      unit,
      endDate,
      priority
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !targetValue || !unit || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['title', 'description', 'category', 'targetValue', 'unit', 'endDate']
      });
    }

    // Validate end date
    const endDateObj = new Date(endDate);
    if (endDateObj <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'End date must be in the future'
      });
    }

    // Create goal
    const goal = new Goal({
      userId: req.user.id,
      title,
      description,
      category,
      targetValue,
      unit,
      endDate: endDateObj,
      priority: priority || 'medium'
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });

  } catch (error) {
    console.error('Create goal error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating goal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { userId: req.user.id, isActive: true };
    if (status) query.status = status;
    if (category) query.category = category;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    const total = await Goal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        goals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalGoals: total,
          hasNextPage: skip + goals.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goals',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    }).populate('userId', 'name email');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });

  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Update fields
    const updateFields = ['title', 'description', 'category', 'targetValue', 'unit', 'endDate', 'priority', 'status'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    // Validate end date if updated
    if (req.body.endDate) {
      const endDateObj = new Date(req.body.endDate);
      if (endDateObj <= goal.startDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
      goal.endDate = endDateObj;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });

  } catch (error) {
    console.error('Update goal error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating goal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
exports.updateGoalProgress = async (req, res) => {
  try {
    const { increment = 1 } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update progress for non-active goal'
      });
    }

    await goal.updateProgress(increment);

    res.status(200).json({
      success: true,
      message: 'Goal progress updated successfully',
      data: goal
    });

  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating goal progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset goal progress
// @route   PUT /api/goals/:id/reset
// @access  Private
exports.resetGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.resetProgress();

    res.status(200).json({
      success: true,
      message: 'Goal progress reset successfully',
      data: goal
    });

  } catch (error) {
    console.error('Reset goal progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting goal progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Soft delete
    goal.isActive = false;
    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting goal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get goals summary
// @route   GET /api/goals/summary
// @access  Private
exports.getGoalsSummary = async (req, res) => {
  try {
    const summary = await Goal.getGoalsSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get goals summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goals summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get expired goals
// @route   GET /api/goals/expired
// @access  Private
exports.getExpiredGoals = async (req, res) => {
  try {
    const expiredGoals = await Goal.getExpiredGoals(req.user.id);

    res.status(200).json({
      success: true,
      data: expiredGoals
    });

  } catch (error) {
    console.error('Get expired goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expired goals',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 