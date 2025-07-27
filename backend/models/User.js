const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in query results by default
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  verificationTokenExpire: Date,
  refreshToken: String,
  refreshTokenExpire: Date,
  profile: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  mentalHealthData: {
    currentChallenge: {
      type: String,
      enum: ['7-day', '21-day', '30-day'],
      required: false // Make it optional instead of defaulting to null
    },
    challengeStartDate: Date,
    lastMoodEntry: Date,
    lastEmotionAnalysis: Date,
    wellnessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Instance method to generate verification token
userSchema.methods.getVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Virtual for full name (if first/last name are added later)
userSchema.virtual('initials').get(function() {
  if (!this.name) return '';
  const names = this.name.split(' ');
  return names.length > 1 ? 
    names[0].charAt(0) + names[names.length - 1].charAt(0) : 
    names[0].charAt(0);
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.verificationToken;
    delete ret.verificationTokenExpire;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
