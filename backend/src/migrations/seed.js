const bcrypt = require('bcrypt');
const db = require('../config/db');

// ── Test user for Google Play review ─────────────────────────────────────────
const TEST_USERS = [
  {
    name: 'Test User',
    emailid: 'testuser@onebind.com',
    mobilenumber: '9999999999',
    password: 'Test@1234',          // plain-text → will be hashed below
    dob: '1995-01-15',
    profession: 'Loan Agent',
    location: 'Chennai',
    address: '123 Test Street, Chennai',
    isactive: true,
  },
];

async function runSeed() {
  console.log('\n🌱 Running seed data...');
  const client = await db.pool.connect();

  try {
    for (const user of TEST_USERS) {
      // Check if user already exists
      const { rows } = await client.query(
        'SELECT id FROM connector WHERE emailid = $1 OR mobilenumber = $2',
        [user.emailid, user.mobilenumber]
      );

      if (rows.length > 0) {
        console.log(`  ⏭️  Connector already exists: ${user.emailid} (id: ${rows[0].id})`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      await client.query(
        `INSERT INTO connector
           (name, emailid, mobilenumber, password, dob, profession, location, address, isactive, "createdDate", "updatedDate")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          user.name,
          user.emailid,
          user.mobilenumber,
          hashedPassword,
          user.dob,
          user.profession,
          user.location,
          user.address,
          user.isactive,
        ]
      );

      console.log(`  ✅ Seeded connector: ${user.emailid}`);
    }

    console.log('🌱 Seed complete!\n');
  } catch (err) {
    // Non-fatal — don't crash the server if seed fails
    console.error('⚠️  Seed error (non-fatal):', err.message);
  } finally {
    client.release();
  }
}

module.exports = { runSeed };
