import { testConnection } from './lib/db';

async function test() {
  console.log('🔍 Testing database connection...');
  const result = await testConnection();
  console.log('✅ Test result:', result);
}

test();