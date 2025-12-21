// Lokasi: app/api/health/route.ts
// ✅ DIPERBAIKI: Sesuaikan dengan PostgreSQL format

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await pool.query('SELECT 1 as test');

    return NextResponse.json({
      status: 'ok',
      message: 'API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
      dbTest: result.rows[0],
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}