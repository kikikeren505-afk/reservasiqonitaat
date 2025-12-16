// Lokasi: app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    console.log('GET /api/admin/users');

    const usersData: any = await query(
      'SELECT id, nama_lengkap, nomor_hp, alamat, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    console.log('Users found:', usersData?.length || 0);

    return NextResponse.json(
      {
        success: true,
        data: usersData || [],
        count: usersData?.length || 0,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}