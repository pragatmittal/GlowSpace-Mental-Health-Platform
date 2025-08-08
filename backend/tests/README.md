# Mood Tracking API Tests

This directory contains comprehensive automated tests for the Mood Tracking API endpoints using Jest and Supertest.

## 🧪 Test Coverage

The tests cover all major functionality of the mood tracking system:

### ✅ API Endpoints Tested
- **POST /api/mood/entry** - Create mood entries
- **GET /api/mood/entries** - Retrieve mood entries with filtering and pagination
- **PUT /api/mood/entry/:id** - Update mood entries
- **DELETE /api/mood/entry/:id** - Delete mood entries
- **GET /api/mood/analytics** - Get mood analytics and trends
- **GET /api/mood/streaks** - Get mood streaks
- **GET /api/mood/insights** - Get mood insights
- **POST /api/mood/upload/voice** - Upload voice recordings
- **POST /api/mood/upload/photo** - Upload photos
- **PUT /api/mood/alert/:id/acknowledge** - Acknowledge alerts

### ✅ Validation Tests
- Required field validation
- Data type validation
- Range validation (intensity 1-10)
- Enum validation (mood, activity, social context)
- Length validation (notes, tags)
- File type validation

### ✅ Error Handling Tests
- Authentication errors (401)
- Authorization errors (403)
- Validation errors (400)
- Not found errors (404)
- Server errors (500)
- Network errors
- Database errors

### ✅ Edge Cases
- Empty data sets
- Invalid IDs
- Cross-user access attempts
- Rate limiting
- File upload limits
- Concurrent operations

## 🚀 Running Tests

### Prerequisites
1. **MongoDB** - Make sure MongoDB is running locally or set up a test database
2. **Node.js** - Version 16 or higher
3. **Dependencies** - Run `npm install` in the backend directory

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/mood.test.js

# Run tests with custom pattern
npm test -- --testNamePattern="should create a new mood entry"
```

### Advanced Test Runner

```bash
# Run with custom test runner
node scripts/runTests.js

# Run in watch mode
node scripts/runTests.js --watch

# Run without coverage
node scripts/runTests.js --no-coverage

# Run specific test file
node scripts/runTests.js --file mood.test.js

# Run specific test pattern
node scripts/runTests.js --pattern "validation"

# Run silently
node scripts/runTests.js --silent
```

### Environment Variables

Set these environment variables for testing:

```bash
# Required
NODE_ENV=test
JWT_SECRET=test-secret-key

# Optional (defaults to localhost)
MONGODB_URI_TEST=mongodb://localhost:27017/glowspace_test

# Optional (suppress console logs)
SUPPRESS_LOGS=true
```

## 📊 Test Structure

### Test Files
- `mood.test.js` - Main mood tracking API tests
- `setup.js` - Jest configuration and test utilities

### Test Categories

#### 1. **Mood Entry Creation Tests**
- ✅ Valid mood entry creation
- ✅ Minimal required data
- ✅ All optional fields
- ✅ Validation errors
- ✅ Authentication requirements

#### 2. **Mood Entry Retrieval Tests**
- ✅ Get all entries
- ✅ Pagination
- ✅ Filtering by mood, activity, social context
- ✅ Time range filtering
- ✅ Query parameter validation

#### 3. **Mood Entry Update Tests**
- ✅ Valid updates
- ✅ Validation during updates
- ✅ Authorization checks
- ✅ Non-existent entry handling

#### 4. **Mood Entry Deletion Tests**
- ✅ Valid deletions
- ✅ Authorization checks
- ✅ Non-existent entry handling

#### 5. **Analytics Tests**
- ✅ Analytics calculation
- ✅ Empty data handling
- ✅ Time range filtering
- ✅ Authentication requirements

#### 6. **Streaks Tests**
- ✅ Streak calculation
- ✅ Authentication requirements

#### 7. **Insights Tests**
- ✅ Insight generation
- ✅ Parameter handling
- ✅ Authentication requirements

#### 8. **File Upload Tests**
- ✅ Voice recording upload
- ✅ Photo upload
- ✅ File type validation
- ✅ Authentication requirements

#### 9. **Alert Tests**
- ✅ Alert acknowledgment
- ✅ Non-existent alert handling

## 🔧 Test Utilities

The test setup provides several utility functions:

```javascript
// Create test user
const user = await testUtils.createTestUser({
  name: 'Test User',
  email: 'test@example.com'
});

// Create test mood entry
const entry = await testUtils.createTestMoodEntry(user._id, {
  mood: 'happy',
  intensity: 7,
  notes: 'Test entry'
});

// Generate auth token
const token = testUtils.generateAuthToken(user._id, user.email);

// Clean up test data
await testUtils.cleanupTestData();
```

## 📈 Coverage Reports

After running tests with coverage, you can view detailed reports:

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# View console coverage summary
npm test -- --coverage --verbose
```

### Coverage Targets
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## 🐛 Debugging Tests

### Enable Debug Logging
```bash
# Enable debug mode
DEBUG=* npm test

# Enable specific debug categories
DEBUG=mood:*,auth:* npm test
```

### Run Single Test
```bash
# Run specific test
npm test -- --testNamePattern="should create a new mood entry"

# Run with verbose output
npm test -- --verbose --testNamePattern="should create a new mood entry"
```

### Database Debugging
```bash
# Connect to test database
mongosh mongodb://localhost:27017/glowspace_test

# View test collections
db.moodentries.find()
db.users.find()
```

## 🚨 Common Issues

### 1. **Database Connection Issues**
```bash
# Error: MongoDB connection failed
# Solution: Start MongoDB service
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 2. **Port Already in Use**
```bash
# Error: Port 5001 already in use
# Solution: Kill existing process
lsof -ti:5001 | xargs kill -9
```

### 3. **JWT Secret Issues**
```bash
# Error: JWT_SECRET not set
# Solution: Set environment variable
export JWT_SECRET=test-secret-key
```

### 4. **Test Timeout Issues**
```bash
# Error: Test timeout
# Solution: Increase timeout in jest.config.js
testTimeout: 60000
```

## 📝 Adding New Tests

### Test Template
```javascript
describe('New Feature Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    testUser = await testUtils.createTestUser();
    authToken = testUtils.generateAuthToken(testUser._id, testUser.email);
  });

  afterAll(async () => {
    await testUtils.cleanupTestData();
  });

  it('should perform expected behavior', async () => {
    // Arrange
    const testData = { /* test data */ };

    // Act
    const response = await request(app)
      .post('/api/new-endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Best Practices
1. **Use descriptive test names** - "should create mood entry with valid data"
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Test both success and failure cases**
4. **Clean up test data** in afterAll hooks
5. **Use test utilities** for common operations
6. **Mock external dependencies** when appropriate

## 🤝 Contributing

When adding new tests:

1. **Follow existing patterns** in `mood.test.js`
2. **Add comprehensive coverage** for new features
3. **Include edge cases** and error scenarios
4. **Update this README** with new test categories
5. **Ensure tests pass** before submitting

## 📞 Support

For test-related issues:

1. Check the **Common Issues** section above
2. Review test logs for specific error messages
3. Verify database connectivity
4. Ensure all dependencies are installed
5. Check environment variable configuration 