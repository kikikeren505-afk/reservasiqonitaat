// Lokasi: app/api/admin/reservasi/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    console.log('GET /api/admin/reservasi');

    const reservasiData: any = await query(
      `SELECT 
        r.*,
        u.nama_lengkap as nama_user,
        u.email as email_user,
        k.nama as nama_kost,
        k.alamat as alamat_kost
      FROM reservasi r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN kost k ON r.kost_id = k.id
      ORDER BY r.created_at DESC`
    );

    console.log('Reservasi found:', reservasiData?.length || 0);

    return NextResponse.json(
      {
        success: true,
        data: reservasiData || [],
        count: reservasiData?.length || 0,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching reservasi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch reservasi',
        error: error.message,
      },
      { status: 500 }
    );
  }
}