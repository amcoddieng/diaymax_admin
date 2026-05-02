// Test script for API connection
const axios = require('axios');

const API_URL = 'http://192.168.1.8:8080';
const TEST_CREDENTIALS = {
  email: 'admin@tissenza.com',
  password: 'admin123'
};

async function testLogin() {
  console.log('🚀 Testing API connection...');
  console.log(`📡 API URL: ${API_URL}`);
  console.log(`👤 Testing with: ${TEST_CREDENTIALS.email}`);
  console.log('');

  try {
    console.log('⏳ Sending login request...');
    const response = await axios.post(`${API_URL}/api/auth/login`, TEST_CREDENTIALS);
    
    console.log('✅ Login successful!');
    console.log('📊 Response data:');
    console.log('- Status:', response.status);
    console.log('- Success:', response.data.success);
    console.log('- Message:', response.data.message);
    console.log('- User ID:', response.data.data.userId);
    console.log('- Username:', response.data.data.username);
    console.log('- Role:', response.data.data.role);
    console.log('- Token length:', response.data.data.token.length);
    console.log('- Expires in:', response.data.data.expiresIn + 'ms');
    
    // Test token validation
    console.log('');
    console.log('🔐 Testing token validation...');
    const token = response.data.data.token;
    
    const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Token validation successful!');
    console.log('👤 Current user data:');
    console.log('- ID:', userResponse.data.data.id);
    console.log('- Name:', userResponse.data.data.prenom + ' ' + userResponse.data.data.nom);
    console.log('- Email:', userResponse.data.data.email);
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('- Status:', error.response.status);
      console.error('- Message:', error.response.data.message);
      console.error('- Error Code:', error.response.data.errorCode);
    } else if (error.request) {
      console.error('- Network error: Could not connect to API');
      console.error('- Make sure the server is running at:', API_URL);
    } else {
      console.error('- Error:', error.message);
    }
  }
}

console.log('🧪 Diaymax Admin API Test');
console.log('='.repeat(40));
testLogin();
