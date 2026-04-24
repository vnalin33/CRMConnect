require('dotenv').config();

const testRegister = async () => {
  const testUser = {
    name: 'Test User',
    email: `testuser_${Date.now()}@test.com`,
    phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Test@1234',
  };

  console.log('Testing registration with:', testUser);

  try {
    const response = await fetch('http://127.0.0.1:5005/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.data?.token) {
      console.log('\n✅ Registration successful! Token received.');
      console.log('User ID:', data.data.user?.id);

      // Now test login with same credentials
      console.log('\n--- Testing Login ---');
      const loginRes = await fetch('http://127.0.0.1:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: testUser.email,
          password: testUser.password,
        }),
      });

      const loginData = await loginRes.json();
      console.log('Login Status:', loginRes.status);
      console.log('Login Response:', JSON.stringify(loginData, null, 2));

      if (loginData.data?.token) {
        console.log('\n✅ Login successful! Full auth flow works.');
      } else {
        console.log('\n❌ Login failed.');
      }
    } else {
      console.log('\n❌ Registration failed.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  process.exit(0);
};

testRegister();
