import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    const [rows] = await pool.query('SELECT 1 as test');
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}