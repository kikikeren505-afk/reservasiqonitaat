import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Ambil semua metode pembayaran aktif
export async function GET(request: NextRequest) {
  try {
    const methods = await db.query(
      `SELECT * FROM payment_methods 
       WHERE is_active = TRUE 
       ORDER BY method_type, id`
    );

    return NextResponse.json({ data: methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}