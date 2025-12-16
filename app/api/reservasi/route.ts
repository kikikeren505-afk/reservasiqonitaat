// Lokasi: app/api/reservasi/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    console.log('GET /api/reservasi - user_id:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Query reservasi dengan JOIN ke tabel kost untuk mendapatkan info kost
    const reservasiData: any = await query(
      `SELECT 
        r.id,
        r.user_id,
        r.kost_id,
        r.tanggal_mulai,
        r.tanggal_selesai,
        r.durasi_bulan,
        r.total_harga,
        r.status,
        r.catatan,
        r.created_at,
        k.nama as nama_kost,
        k.alamat as alamat_kost,
        k.harga as harga_kost
      FROM reservasi r
      LEFT JOIN kost k ON r.kost_id = k.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
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