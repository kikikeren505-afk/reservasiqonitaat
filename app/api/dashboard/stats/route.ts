// Lokasi: app/api/dashboard/stats/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ✅ Tambahkan ini untuk fix dynamic server error
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    console.log('GET /api/dashboard/stats - user_id:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Query total reservasi user - DIPERBAIKI: query() sudah return rows langsung
    const totalReservasiResult: any = await query(
      'SELECT COUNT(*) as total FROM reservasi WHERE user_id = $1',
      [userId]
    );
    const totalReservasi = parseInt(totalReservasiResult[0]?.total) || 0;

    // Query reservasi aktif (status pending atau confirmed)
    const reservasiAktifResult: any = await query(
      `SELECT COUNT(*) as total 
       FROM reservasi 
       WHERE user_id = $1 
       AND status IN ('pending', 'confirmed')`,
      [userId]
    );
    const reservasiAktif = parseInt(reservasiAktifResult[0]?.total) || 0;

    // Query kost tersedia (status = 'tersedia')
    const kostTersediaResult: any = await query(
      "SELECT COUNT(*) as total FROM kost WHERE status = 'tersedia'"
    );
    const kostTersedia = parseInt(kostTersediaResult[0]?.total) || 0;

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
        error: 'Gagal mengambil statistik dashboard',
        message: error.message,
      },
      { status: 500 }
    );
  }
}