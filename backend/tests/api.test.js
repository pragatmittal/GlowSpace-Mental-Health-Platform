const request = require('supertest');
const { app, mongoose } = require('../server');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const EmotionData = require('../models/EmotionData');
const Assessment = require('../models/Assessment');
const { sendEmail, sendVerificationEmail } = require('../utils/emailSender');
const crypto = require('crypto');

// Mock email sending
jest.mock('../utils/emailSender', () => {
  const mockSendEmail = jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id'
  });
  
  const mockSendVerificationEmail = jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id'
  });

  return {
    sendEmail: mockSendEmail,
    sendVerificationEmail: mockSendVerificationEmail
  };
});

let authToken;
let testUser;

// Debug helper
const logResponse = (res, context) => {
  console.log(`\n=== ${context} ===`);
  console.log('Status:', res.status);
  console.log('Body:', JSON.stringify(res.body, null, 2));
  if (res.status >= 400) {
    console.log('Error details:', res.body.error || res.body.message);
  }
};

// Setup test data
const setupTestData = async (userId) => {
  try {
    console.log('Setting up test data for user:', userId);

    // Create mood entry
    const moodEntry = new MoodEntry({
      userId,
      ...global.mockData.moodEntry
    });
    await moodEntry.save();
    console.log('Created mood entry');

    // Create emotion data
    const emotionData = new EmotionData({
      userId,
      ...global.mockData.emotionData
    });
    await emotionData.save();
    console.log('Created emotion data');

    // Create assessment
    const assessment = new Assessment({
      userId,
      ...global.mockData.assessment
    });
    await assessment.save();
    console.log('Created assessment');

    return { moodEntry, emotionData, assessment };
  } catch (error) {
    console.error('Setup test data error:', error);
    throw error;
  }
};

beforeAll(async () => {
  try {
    console.log('Starting test setup...');
    
    // Ensure we're disconnected before connecting
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from previous connection');
    }

    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to test database');

    // Clear test database
    await Promise.all([
      User.deleteMany({}),
      MoodEntry.deleteMany({}),
      EmotionData.deleteMany({}),
      Assessment.deleteMany({})
    ]);
    console.log('Cleared test database');
    
    // Create test user
    testUser = await User.create(global.mockData.user);
    console.log('Created test user:', testUser._id);

    // Setup test data
    await setupTestData(testUser._id);
    console.log('Setup test data completed');

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.mockData.user.email,
        password: global.mockData.user.password
      });

    authToken = loginResponse.body.accessToken;
    console.log('Got auth token');

  } catch (error) {
    console.error('Test setup error:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
    throw error;
  }
});

afterAll(async () => {
  try {
    // Clean up test data
    await Promise.all([
      User.deleteMany({}),
      MoodEntry.deleteMany({}),
      EmotionData.deleteMany({}),
      Assessment.deleteMany({})
    ]);
    console.log('Cleaned up test data');
    
    // Close database connection
    await mongoose.disconnect();
    console.log('Closed database connection');
  } catch (error) {
    console.error('Test cleanup error:', error);
    throw error;
  }
});

// Reset database before each test
beforeEach(async () => {
  try {
    // Clear all collections except users and their related data
    const collections = mongoose.connection.collections;
    const excludedCollections = ['users', 'moodentries', 'emotiondatas', 'assessments'];
    
    for (const key in collections) {
      if (!excludedCollections.includes(key)) {
        await collections[key].deleteMany();
        console.log(`Cleared collection: ${key}`);
      }
    }
  } catch (error) {
    console.error('Test reset error:', error);
    throw error;
  }
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Clear mock calls
      sendEmail.mockClear();
      sendVerificationEmail.mockClear();

      // Create verification token for mock
      const mockVerificationToken = crypto.randomBytes(20).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(mockVerificationToken)
        .digest('hex');

      // Mock the verification token generation with proper implementation
      const getVerificationTokenMock = jest.spyOn(User.prototype, 'getVerificationToken')
        .mockImplementation(function() {
          this.verificationToken = hashedToken;
          this.verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
          return mockVerificationToken;
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send(global.mockData.newUser);
      
      logResponse(res, 'Register User');
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.mentalHealthData).toBeDefined();
      expect(res.body.user.mentalHealthData.currentChallenge).toBe('7-day');
      
      // Verify email mock was called with correct data
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        global.mockData.newUser.email,
        global.mockData.newUser.name,
        mockVerificationToken
      );

      // Verify user was created with correct data
      const user = await User.findOne({ email: global.mockData.newUser.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(global.mockData.newUser.name);
      expect(user.verificationToken).toBe(hashedToken);
      expect(user.mentalHealthData.currentChallenge).toBe('7-day');

      // Clean up mock
      getVerificationTokenMock.mockRestore();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: global.mockData.user.email,
          password: global.mockData.user.password
        });
      
      logResponse(res, 'Login User');
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });
});

describe('Dashboard Endpoints', () => {
  describe('GET /api/dashboard/data', () => {
    it('should get dashboard data', async () => {
      const res = await request(app)
        .get('/api/dashboard/data')
        .set('Authorization', `Bearer ${authToken}`);
      
      logResponse(res, 'Get Dashboard Data');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/dashboard/progress', () => {
    it('should get user progress', async () => {
      const res = await request(app)
        .get('/api/dashboard/progress')
        .set('Authorization', `Bearer ${authToken}`);
      
      logResponse(res, 'Get User Progress');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});

describe('Emotion Endpoints', () => {
  describe('POST /api/emotions/analyze', () => {
    it('should analyze emotions', async () => {
      const res = await request(app)
        .post('/api/emotions/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send(global.mockData.emotionData);
      
      logResponse(res, 'Analyze Emotions');
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/emotions/history', () => {
    it('should get emotion history', async () => {
      const res = await request(app)
        .get('/api/emotions/history')
        .set('Authorization', `Bearer ${authToken}`);
      
      logResponse(res, 'Get Emotion History');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});

describe('Chat Endpoints', () => {
  let messageId;
  let roomId = 'test-room';

  describe('POST /api/chat/send', () => {
    it('should send a message', async () => {
      const res = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test message',
          roomId,
          messageType: 'text'
        });
      
      logResponse(res, 'Send Message');
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      messageId = res.body.data._id;
    });
  });

  describe('GET /api/chat/room/:roomId', () => {
    it('should get room messages', async () => {
      const res = await request(app)
        .get(`/api/chat/room/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      logResponse(res, 'Get Room Messages');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});

describe('Assessment Endpoints', () => {
  describe('POST /api/assessments', () => {
    it('should create assessment', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(global.mockData.assessment);
      
      logResponse(res, 'Create Assessment');
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
    });
  });

  describe('GET /api/assessments/templates', () => {
    it('should get assessment templates', async () => {
      const res = await request(app)
        .get('/api/assessments/templates')
        .set('Authorization', `Bearer ${authToken}`);
      
      logResponse(res, 'Get Assessment Templates');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});

describe('Error Cases', () => {
  describe('Authentication', () => {
    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPass123!'
        });
      
      logResponse(res, 'Invalid Login');
      expect(res.status).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    it('should fail without auth token', async () => {
      const res = await request(app)
        .get('/api/dashboard/data');
      
      logResponse(res, 'No Auth Token');
      expect(res.status).toBe(401);
    });
  });
}); 