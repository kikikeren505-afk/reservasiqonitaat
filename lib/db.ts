import mysql from 'mysql2/promise';

// Konfigurasi koneksi database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kost_reservasi', // FIXED: ubah dari 'kos_reservasi' ke 'kost_reservasi'
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Buat connection pool
let pool: mysql.Pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Database pool created successfully');
} catch (error) {
  console.error('❌ Failed to create database pool:', error);
  throw error;
}

// Test koneksi database
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Query untuk multiple rows
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params || []);
    return results;
  } catch (error: any) {
    console.error('❌ Database query error:', error.message);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    throw error;
  }
}

// Query untuk single row
export async function queryOne(sql: string, params?: any[]) {
  try {
    const [results]: any = await pool.execute(sql, params || []);
    return results[0] || null;
  } catch (error: any) {
    console.error('❌ Database queryOne error:', error.message);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    throw error;
  }
}

// Insert data dan return ID
export async function insert(sql: string, params?: any[]) {
  try {
    const [result]: any = await pool.execute(sql, params || []);
    return result.insertId;
  } catch (error: any) {
    console.error('❌ Database insert error:', error.message);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    throw error;
  }
}

// Update/Delete data dan return affected rows
export async function execute(sql: string, params?: any[]) {
  try {
    const [result]: any = await pool.execute(sql, params || []);
    return result.affectedRows;
  } catch (error: any) {
    console.error('❌ Database execute error:', error.message);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    throw error;
  }
}

// Transaction support
export async function transaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Close pool (untuk cleanup)
export async function closePool() {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
    throw error;
  }
}

export default pool;