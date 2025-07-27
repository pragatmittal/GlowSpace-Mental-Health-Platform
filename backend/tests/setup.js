require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.PORT = 5002;

// Email settings for testing
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASSWORD = 'test-password';
process.env.SMTP_FROM = 'GlowSpace <test@test.com>';
process.env.CLIENT_URL = 'http://localhost:3000';

// Use a dedicated test database
process.env.MONGODB_URI_TEST = 'mongodb+srv://username:password@cluster.mongodb.net/glowspace-test';

// Mock data for testing
global.mockData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123!',
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
    tags: ['relaxed', 'productive']
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

// Increase timeout for async operations
jest.setTimeout(30000); 