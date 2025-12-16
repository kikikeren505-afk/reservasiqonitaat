// Lokasi: app/api/dashboard/stats/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    console.log('GET /api/dashboard/stats - user_id:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Query total reservasi user
    const totalReservasiResult: any = await query(
      'SELECT COUNT(*) as total FROM reservasi WHERE user_id = ?',
      [userId]
    );
    const totalReservasi = totalReservasiResult[0]?.total || 0;

    // Query reservasi aktif (status pending atau confirmed)
    const reservasiAktifResult: any = await query(
      `SELECT COUNT(*) as total 
       FROM reservasi 
       WHERE user_id = ? 
       AND status IN ('pending', 'confirmed')`,
      [userId]
    );
    const reservasiAktif = reservasiAktifResult[0]?.total || 0;

    // Query kost tersedia (status = 'tersedia')
    const kostTersediaResult: any = await query(
      "SELECT COUNT(*) as total FROM kost WHERE status = 'tersedia'"
    );
    const kostTersedia = kostTersediaResult[0]?.total || 0;

    const stats = {
      totalReservasi,
      reservasiAktif,
      kostTersedia,
    };

    console.log('Dashboard stats:', stats);

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        message: error.message,
      },
      { status: 500 }
    );
  }
}