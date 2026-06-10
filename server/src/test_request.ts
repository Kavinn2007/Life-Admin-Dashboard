import axios from 'axios';

async function main() {
  try {
    console.log('1. Logging in via API...');
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'admin@lifeadmin.ai',
      password: 'admin123',
    });
    
    const token = loginRes.data.token;
    console.log('Login successful, token retrieved:', token ? 'YES' : 'NO');

    console.log('2. Attempting to add a subscription via API...');
    const subRes = await axios.post(
      'http://127.0.0.1:5000/api/subscriptions',
      {
        serviceName: 'Spotify Test API',
        category: 'Entertainment',
        cost: 99,
        billingCycle: 'Monthly',
        renewalDate: '2026-06-06',
        paymentMethod: 'Credit Card',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Subscription API response status:', subRes.status);
    console.log('Subscription API response data:', subRes.data);
  } catch (error: any) {
    if (error.response) {
      console.error('API Error Response Status:', error.response.status);
      console.error('API Error Response Data:', error.response.data);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

main();
