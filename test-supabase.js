const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Supabase Connection with different ports...\n');

const connections = [
  {
    name: 'Transaction Pooler (Port 6543)',
    url: `postgresql://postgres.prixkdebtqtwbtnftrdo:1upD5H0UVsKFH5Ne@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
  },
  {
    name: 'Session Pooler (Port 5432)',
    url: `postgresql://postgres.prixkdebtqtwbtnftrdo:1upD5H0UVsKFH5Ne@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`
  },
  {
    name: 'Direct IPv4 (Port 5432)',
    url: `postgresql://postgres.prixkdebtqtwbtnftrdo:1upD5H0UVsKFH5Ne@3.111.225.200:5432/postgres`
  }
];

async function testConnection(config) {
  const pool = new Pool({
    connectionString: config.url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  console.log(`📡 Testing ${config.name}...`);
  
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as time');
    const duration = Date.now() - start;
    
    console.log(`✅ SUCCESS! (${duration}ms)`);
    console.log(`   Time: ${result.rows[0].time}\n`);
    return true;
  } catch (error) {
    console.error(`❌ FAILED!`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  } finally {
    await pool.end();
  }
}

async function runTests() {
  for (const config of connections) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 USE THIS CONNECTION: ${config.name}`);
      break;
    }
  }
  console.log('✅ Test selesai!');
}

runTests();