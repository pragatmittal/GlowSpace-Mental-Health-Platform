module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'backend/routes/**/*.js',
    'backend/controllers/**/*.js',
    'backend/models/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000
};
