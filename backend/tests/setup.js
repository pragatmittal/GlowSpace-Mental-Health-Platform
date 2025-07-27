// Test setup file for Jest
const mongoose = require('mongoose');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/glowspace_test';

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Global mock data for tests
global.mockData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    isVerified: true,
    role: 'user',
    profile: {
      gender: 'prefer_not_to_say',
      dateOfBirth: new Date('1990-01-01'),
      phone: '+1234567890',
      address: {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipCode: '12345'
      }
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      theme: 'light',
      language: 'en'
    },
    mentalHealthData: {
      currentChallenge: '7-day',
      challengeStartDate: new Date(),
      lastMoodEntry: new Date(),
      lastEmotionAnalysis: new Date(),
      wellnessScore: 75
    }
  },
  newUser: {
    name: 'New User',
    email: 'new@example.com',
    password: 'NewPass123!',
    role: 'user',
    profile: {
      gender: 'prefer_not_to_say',
      dateOfBirth: new Date('1995-01-01')
    },
    preferences: {
      theme: 'light',
      language: 'en'
    },
    mentalHealthData: {
      currentChallenge: '7-day',
      challengeStartDate: new Date(),
      lastMoodEntry: new Date(),
      lastEmotionAnalysis: new Date(),
      wellnessScore: 75
    }
  },
  moodEntry: {
    mood: 'happy',
    intensity: 8,
    notes: 'Test mood entry',
    tags: ['relaxed', 'productive'],
    timeOfDay: 'afternoon',
    entryMethod: 'manual'
  },
  emotionData: {
    emotions: {
      happy: 80,
      sad: 10,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
      neutral: 10
    },
    dominantEmotion: 'happy',
    confidence: 80,
    sessionId: 'test-session',
    analysisMetadata: {
      duration: 60,
      framesAnalyzed: 100,
      detectionMethod: 'realtime',
      deviceInfo: {
        userAgent: 'test-agent',
        platform: 'test-platform',
        browser: 'test-browser'
      }
    },
    contextualData: {
      timeOfDay: 'morning',
      location: 'home',
      activity: 'working',
      notes: 'Test emotion analysis'
    }
  },
  assessment: {
    type: 'mood',
    title: 'Daily Mood Check',
    description: 'Test assessment',
    data: {
      scores: {
        anxiety: 3,
        depression: 2,
        stress: 4
      },
      responses: {
        q1: 'Test response 1',
        q2: 'Test response 2'
      }
    }
  }
};

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const defaultData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      isActive: true,
      mentalHealthData: {
        currentChallenge: '7-day',
        challengeStartDate: new Date(),
        lastMoodEntry: new Date(),
        lastEmotionAnalysis: new Date(),
        wellnessScore: 75
      },
      ...userData
    };
    
    const user = new User(defaultData);
    await user.save();
    return user;
  },

  // Create test mood entry
  createTestMoodEntry: async (userId, moodData = {}) => {
    const MoodEntry = require('../models/MoodEntry');
    const defaultData = {
      userId,
      mood: 'neutral',
      intensity: 5,
      activity: 'other',
      socialContext: 'alone',
      timeOfDay: 'afternoon',
      entryMethod: 'manual',
      ...moodData
    };
    
    const entry = new MoodEntry(defaultData);
    await entry.save();
    return entry;
  },

  // Generate auth token
  generateAuthToken: (userId, email) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  // Clean up test data
  cleanupTestData: async () => {
    const User = require('../models/User');
    const MoodEntry = require('../models/MoodEntry');
    
    await User.deleteMany({});
    await MoodEntry.deleteMany({});
  }
};

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions in tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
}); 