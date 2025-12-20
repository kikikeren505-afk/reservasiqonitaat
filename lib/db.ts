import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export pool sebagai default
export default pool;

// Export query function untuk kompatibilitas dengan kode lama
export async function query(sql: string, values?: any[]) {
  const [rows] = await pool.query(sql, values);
  return rows;
}