const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1002, emailid: 'loga@gmail.com' },
  process.env.JWT_SECRET || 'your_super_secret_key_for_mnc_standards',
  { expiresIn: '30m' }
);

async function testApi() {
  console.log(`Testing with connector 1002`);
  
  const testRoute = async (path) => {
    try {
      const res = await fetch(`http://localhost:5001${path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`\n${path} — Status: ${res.status}`);
      const text = await res.text();
      try {
         const data = JSON.parse(text);
         console.log(JSON.stringify(data).substring(0, 150));
      } catch(e) {
         console.log('Response NOT JSON:', text.substring(0, 150));
      }
    } catch (e) { console.error('Error', e); }
  }

  await testRoute('/api/connector/profile');
  await testRoute('/api/leads/unassigned');
  await testRoute('/api/leads/my');
}

testApi();
