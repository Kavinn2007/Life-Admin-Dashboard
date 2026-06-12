const axios = require('axios');

const BACKEND_URL = 'https://life-admin-dashboard.onrender.com/api';
const FRONTEND_URL = 'https://life-admin-dashboard-gamma.vercel.app';

async function verifyFrontendConfig() {
  console.log('--- Checking Vercel Frontend Configuration ---');
  try {
    // 1. Fetch frontend index.html
    const htmlResponse = await axios.get(FRONTEND_URL);
    const html = htmlResponse.data;
    
    // 2. Find JS bundle src
    const jsRegex = /\/assets\/index-[a-zA-Z0-9_-]+\.js/;
    const match = html.match(jsRegex);
    if (!match) {
      console.error('❌ Could not find JS bundle in Vercel HTML!');
      return false;
    }
    
    const jsUrl = `${FRONTEND_URL}${match[0]}`;
    console.log(`Found JS bundle URL: ${jsUrl}`);
    
    // 3. Fetch JS bundle content
    const jsResponse = await axios.get(jsUrl);
    const jsContent = jsResponse.data;
    
    // 4. Search for backend URL in JS content
    const containsBackendUrl = jsContent.includes('life-admin-dashboard.onrender.com');
    if (containsBackendUrl) {
      console.log('✅ Verified: VITE_API_URL is correctly set to Render backend in Vercel build!');
      return true;
    } else {
      console.error('❌ VITE_API_URL does not point to life-admin-dashboard.onrender.com in Vercel build!');
      // Let's print occurrences of .onrender.com or /api to diagnose
      const renderRegex = /[a-zA-Z0-9_-]+\.onrender\.com/g;
      const found = jsContent.match(renderRegex);
      if (found) {
        console.log(`Found other Render URLs in build: ${JSON.stringify(found)}`);
      } else {
        console.log('No onrender.com URLs found in the JS bundle.');
      }
      return false;
    }
  } catch (err) {
    console.error('❌ Error verifying frontend config:', err.message);
    return false;
  }
}

async function runE2ETests() {
  console.log('\n--- Running Backend E2E Production Tests ---');
  
  const testEmail = `test_${Math.floor(Math.random() * 1000000)}@test.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Production Test User';
  
  let token = '';
  
  try {
    // 1. Register test user
    console.log(`Registering test user: ${testEmail}`);
    const regRes = await axios.post(`${BACKEND_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: testName
    });
    
    if (regRes.status === 201 && regRes.data.token) {
      console.log('✅ Signup successful!');
      token = regRes.data.token;
    } else {
      throw new Error(`Signup failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }
    
    // 2. Login test user (verifying login works)
    console.log('Logging in test user...');
    const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    if (loginRes.status === 200 && loginRes.data.token) {
      console.log('✅ Login successful!');
      token = loginRes.data.token;
    } else {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
    }
    
    // 3. Test JWT Auth & Fetch Protected Route (Bills)
    console.log('Fetching bills (JWT authentication verify)...');
    const billsRes = await axios.get(`${BACKEND_URL}/bills`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (billsRes.status === 200) {
      console.log(`✅ Fetching protected routes successful! Bills count: ${billsRes.data.length}`);
    } else {
      throw new Error(`Fetch bills failed with status ${billsRes.status}`);
    }
    
    // 4. Test Add/Write operation (Write verify)
    console.log('Adding a test bill...');
    const addRes = await axios.post(`${BACKEND_URL}/bills`, {
      title: 'Production Test Bill',
      amount: 100,
      dueDate: new Date().toISOString(),
      category: 'Utilities',
      provider: 'Render Test Provider'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (addRes.status === 201) {
      console.log('✅ Add bill successful!');
    } else {
      throw new Error(`Add bill failed with status ${addRes.status}`);
    }
    
    // 5. Test clean up / check DB persistence
    console.log('Re-fetching bills to verify persistence...');
    const verifyRes = await axios.get(`${BACKEND_URL}/bills`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const createdBill = verifyRes.data.find(b => b.title === 'Production Test Bill');
    if (createdBill) {
      console.log('✅ Persistence verified! Bill found in database.');
      // Delete it
      await axios.delete(`${BACKEND_URL}/bills/${createdBill.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Test bill cleaned up.');
    } else {
      throw new Error('Test bill not found in database!');
    }
    
    console.log('✅ All production E2E tests completed successfully!');
    return true;
  } catch (err) {
    console.error('❌ E2E production test failed!');
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error('Response Data:', JSON.stringify(err.response.data));
    } else {
      console.error('Error Message:', err.message);
    }
    return false;
  }
}

async function run() {
  const frontendOk = await verifyFrontendConfig();
  const backendOk = await runE2ETests();
  
  if (frontendOk && backendOk) {
    console.log('\n🎉 ALL PRODUCTION CHECKS PASSED!');
    process.exit(0);
  } else {
    console.log('\n❌ SOME PRODUCTION CHECKS FAILED!');
    process.exit(1);
  }
}

run();
