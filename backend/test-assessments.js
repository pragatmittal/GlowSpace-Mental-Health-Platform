const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testAssessmentEndpoints() {
  console.log('🧪 Testing Assessment Endpoints...\n');
  
  try {
    // Test 1: Get assessment templates
    console.log('📋 Testing GET /assessments/templates');
    const templatesResponse = await fetch(`${BASE_URL}/assessments/templates`);
    const templatesData = await templatesResponse.json();
    
    console.log('Status:', templatesResponse.status);
    console.log('Response:', JSON.stringify(templatesData, null, 2));
    
    if (templatesData.success && templatesData.data.length > 0) {
      console.log('✅ Templates endpoint working correctly');
      console.log(`Found ${templatesData.data.length} assessment templates\n`);
      
      // Test 2: Get specific template by type
      const firstType = templatesData.data[0].type;
      console.log(`📝 Testing GET /assessments/templates/${firstType}`);
      
      const specificResponse = await fetch(`${BASE_URL}/assessments/templates/${firstType}`);
      const specificData = await specificResponse.json();
      
      console.log('Status:', specificResponse.status);
      console.log('Questions count:', specificData.data?.questions?.length || 0);
      
      if (specificData.success && specificData.data.questions) {
        console.log('✅ Specific template endpoint working correctly\n');
      } else {
        console.log('❌ Specific template endpoint failed\n');
      }
    } else {
      console.log('❌ Templates endpoint failed\n');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

// Run the test
testAssessmentEndpoints();
