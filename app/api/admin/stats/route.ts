// Lokasi: app/api/admin/stats/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    console.log('GET /api/admin/stats');

    // Total Users
    const totalUsersResult: any = await query('SELECT COUNT(*) as total FROM users');
    const totalUsers = totalUsersResult[0]?.total || 0;

    // Total Kost
    const totalKostResult: any = await query('SELECT COUNT(*) as total FROM kost');
    const totalKost = totalKostResult[0]?.total || 0;

    // Total Reservasi
    const totalReservasiResult: any = await query('SELECT COUNT(*) as total FROM reservasi');
    const totalReservasi = totalReservasiResult[0]?.total || 0;

    // Reservasi Pending
    const reservasiPendingResult: any = await query(
      "SELECT COUNT(*) as total FROM reservasi WHERE status = 'pending'"
    );
    const reservasiPending = reservasiPendingResult[0]?.total || 0;

    // Reservasi Confirmed
    const reservasiConfirmedResult: any = await query(
      "SELECT COUNT(*) as total FROM reservasi WHERE status = 'confirmed'"
    );
    const reservasiConfirmed = reservasiConfirmedResult[0]?.total || 0;

    // Kost Tersedia
    const kostTersediaResult: any = await query(
      "SELECT COUNT(*) as total FROM kost WHERE status = 'tersedia'"
    );
    const kostTersedia = kostTersediaResult[0]?.total || 0;

    const stats = {
      totalUsers,
      totalKost,
      totalReservasi,
      reservasiPending,
      reservasiConfirmed,
      kostTersedia,
    };

    console.log('Admin stats:', stats);

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics',
        message: error.message,
      },
      { status: 500 }
    );
  }
}