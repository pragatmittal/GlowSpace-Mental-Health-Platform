const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Goal = require('../models/Goal');

let testUser;
let authToken;

beforeAll(async () => {
  // Create test user
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    isVerified: true,
    role: 'user',
    mentalHealthData: {
      currentChallenge: '7-day',
      challengeStartDate: new Date(),
      lastMoodEntry: new Date(),
      lastEmotionAnalysis: new Date(),
      wellnessScore: 75
    }
  });

  // Login to get auth token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'TestPassword123!'
    });

  authToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  // Clean up
  await User.findByIdAndDelete(testUser._id);
  await Goal.deleteMany({ userId: testUser._id });
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear goals before each test
  await Goal.deleteMany({ userId: testUser._id });
});

describe('Goals API Tests', () => {
  describe('POST /api/goals', () => {
    it('should create a new goal with valid data', async () => {
      const goalData = {
        title: 'Daily Meditation',
        description: 'Meditate for 10 minutes daily',
        category: 'mindfulness',
        targetValue: 30,
        unit: 'days',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(goalData.title);
      expect(response.body.data.userId).toBe(testUser._id.toString());
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.currentValue).toBe(0);
    });

    it('should reject goal creation with missing required fields', async () => {
      const goalData = {
        title: 'Daily Meditation',
        // Missing description, category, targetValue, unit, endDate
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('should reject goal creation with past end date', async () => {
      const goalData = {
        title: 'Daily Meditation',
        description: 'Meditate for 10 minutes daily',
        category: 'mindfulness',
        targetValue: 30,
        unit: 'days',
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Past date
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('End date must be in the future');
    });

    it('should require authentication', async () => {
      const goalData = {
        title: 'Daily Meditation',
        description: 'Meditate for 10 minutes daily',
        category: 'mindfulness',
        targetValue: 30,
        unit: 'days',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await request(app)
        .post('/api/goals')
        .send(goalData)
        .expect(401);
    });
  });

  describe('GET /api/goals', () => {
    beforeEach(async () => {
      // Create test goals
      await Goal.create([
        {
          userId: testUser._id,
          title: 'Goal 1',
          description: 'Description 1',
          category: 'mindfulness',
          targetValue: 10,
          unit: 'days',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          userId: testUser._id,
          title: 'Goal 2',
          description: 'Description 2',
          category: 'physical',
          targetValue: 20,
          unit: 'sessions',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'completed'
        }
      ]);
    });

    it('should get all goals for user', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.goals).toHaveLength(2);
      expect(response.body.data.pagination.totalGoals).toBe(2);
    });

    it('should filter goals by status', async () => {
      const response = await request(app)
        .get('/api/goals?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.goals).toHaveLength(1);
      expect(response.body.data.goals[0].status).toBe('active');
    });

    it('should filter goals by category', async () => {
      const response = await request(app)
        .get('/api/goals?category=mindfulness')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.goals).toHaveLength(1);
      expect(response.body.data.goals[0].category).toBe('mindfulness');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/goals?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.goals).toHaveLength(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/goals/:id', () => {
    let testGoal;

    beforeEach(async () => {
      testGoal = await Goal.create({
        userId: testUser._id,
        title: 'Test Goal',
        description: 'Test Description',
        category: 'mindfulness',
        targetValue: 10,
        unit: 'days',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    });

    it('should get single goal', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Goal');
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/goals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/goals/:id', () => {
    let testGoal;

    beforeEach(async () => {
      testGoal = await Goal.create({
        userId: testUser._id,
        title: 'Test Goal',
        description: 'Test Description',
        category: 'mindfulness',
        targetValue: 10,
        unit: 'days',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    });

    it('should update goal', async () => {
      const updateData = {
        title: 'Updated Goal',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/goals/${testGoal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Goal');
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/goals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('PUT /api/goals/:id/progress', () => {
    let testGoal;

    beforeEach(async () => {
      testGoal = await Goal.create({
        userId: testUser._id,
        title: 'Test Goal',
        description: 'Test Description',
        category: 'mindfulness',
        targetValue: 10,
        unit: 'days',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        currentValue: 5
      });
    });

    it('should update goal progress', async () => {
      const response = await request(app)
        .put(`/api/goals/${testGoal._id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ increment: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentValue).toBe(7);
      expect(response.body.data.streak).toBe(6); // Previous streak + 1
    });

    it('should complete goal when target is reached', async () => {
      const response = await request(app)
        .put(`/api/goals/${testGoal._id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ increment: 5 })
        .expect(200);

      expect(response.body.data.currentValue).toBe(10);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/goals/:id', () => {
    let testGoal;

    beforeEach(async () => {
      testGoal = await Goal.create({
        userId: testUser._id,
        title: 'Test Goal',
        description: 'Test Description',
        category: 'mindfulness',
        targetValue: 10,
        unit: 'days',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    });

    it('should delete goal', async () => {
      const response = await request(app)
        .delete(`/api/goals/${testGoal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify goal is soft deleted
      const deletedGoal = await Goal.findById(testGoal._id);
      expect(deletedGoal.isActive).toBe(false);
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/goals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/goals/summary', () => {
    beforeEach(async () => {
      await Goal.create([
        {
          userId: testUser._id,
          title: 'Active Goal',
          description: 'Active Description',
          category: 'mindfulness',
          targetValue: 10,
          unit: 'days',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active',
          currentValue: 5
        },
        {
          userId: testUser._id,
          title: 'Completed Goal',
          description: 'Completed Description',
          category: 'physical',
          targetValue: 20,
          unit: 'sessions',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'completed',
          currentValue: 20
        }
      ]);
    });

    it('should get goals summary', async () => {
      const response = await request(app)
        .get('/api/goals/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.active).toBe(1);
      expect(response.body.data.completed).toBe(1);
      expect(response.body.data.categories.mindfulness).toBe(1);
      expect(response.body.data.categories.physical).toBe(1);
    });
  });
}); 