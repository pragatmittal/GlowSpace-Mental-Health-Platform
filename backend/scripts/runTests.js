#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Mood Tracking API Tests...\n');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/glowspace_test';

// Test configuration
const testConfig = {
  timeout: 30000,
  verbose: true,
  coverage: true,
  watch: false
};

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--watch')) {
  testConfig.watch = true;
  testConfig.coverage = false;
}

if (args.includes('--no-coverage')) {
  testConfig.coverage = false;
}

if (args.includes('--silent')) {
  testConfig.verbose = false;
}

// Build Jest command
let jestCommand = 'jest';

if (testConfig.watch) {
  jestCommand += ' --watch';
}

if (testConfig.coverage) {
  jestCommand += ' --coverage';
}

if (testConfig.verbose) {
  jestCommand += ' --verbose';
}

jestCommand += ' --testTimeout=30000';
jestCommand += ' --forceExit';
jestCommand += ' --detectOpenHandles';

// Add specific test file if provided
if (args.includes('--file')) {
  const fileIndex = args.indexOf('--file');
  const testFile = args[fileIndex + 1];
  if (testFile) {
    jestCommand += ` tests/${testFile}`;
  }
}

// Add specific test pattern if provided
if (args.includes('--pattern')) {
  const patternIndex = args.indexOf('--pattern');
  const testPattern = args[patternIndex + 1];
  if (testPattern) {
    jestCommand += ` --testNamePattern="${testPattern}"`;
  }
}

console.log('📋 Test Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV}`);
console.log(`   Database: ${process.env.MONGODB_URI_TEST}`);
console.log(`   Timeout: ${testConfig.timeout}ms`);
console.log(`   Coverage: ${testConfig.coverage ? 'Enabled' : 'Disabled'}`);
console.log(`   Watch Mode: ${testConfig.watch ? 'Enabled' : 'Disabled'}`);
console.log(`   Verbose: ${testConfig.verbose ? 'Enabled' : 'Disabled'}`);
console.log('');

// Check if test database is accessible
console.log('🔍 Checking test database connection...');
try {
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Test database connection successful');
  await mongoose.connection.close();
} catch (error) {
  console.error('❌ Test database connection failed:', error.message);
  console.log('💡 Make sure MongoDB is running and accessible');
  process.exit(1);
}

// Run tests
console.log('\n🚀 Running tests...\n');

try {
  execSync(jestCommand, {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  
  console.log('\n✅ All tests completed successfully!');
  
  // Show coverage summary if enabled
  if (testConfig.coverage) {
    const coveragePath = path.join(__dirname, '../coverage/lcov-report/index.html');
    if (fs.existsSync(coveragePath)) {
      console.log(`📊 Coverage report available at: ${coveragePath}`);
    }
  }
  
} catch (error) {
  console.error('\n❌ Tests failed!');
  console.error('Exit code:', error.status);
  process.exit(error.status || 1);
}

console.log('\n🎉 Test run completed!'); 