// Lokasi: lib/db.ts
// ✅ PRODUCTION READY - SSL Conditional

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true }  // ✅ Aman untuk production
    : { rejectUnauthorized: false }, // ✅ Dev aja yang false
});

console.log('✅ PostgreSQL pool created successfully');
console.log('📍 Connecting to Supabase PostgreSQL');

export async function query(sql: string, params?: any[]) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function queryOne(sql: string, params?: any[]) {
  const result = await pool.query(sql, params);
  return result.rows[0] ?? null;
}

export async function execute(sql: string, params?: any[]) {
  const result = await pool.query(sql, params);
  return result.rowCount ?? 0;
}

export default pool;