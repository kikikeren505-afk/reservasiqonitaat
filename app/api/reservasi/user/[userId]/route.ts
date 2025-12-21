// Lokasi: app/api/reservasi/user/[userId]/route.ts
// ✅ DIPERBAIKI: Ganti placeholder MySQL (?) ke PostgreSQL ($1)

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ✅ Tambahkan ini untuk fix dynamic server error
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    console.log('GET /api/reservasi/user - user_id:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // DIPERBAIKI: Ganti ? ke $1
    // Query reservasi user beserta detail kost (FIXED - sesuai struktur table)
    const reservasiResult: any = await query(
      `SELECT 
        r.id,
        r.user_id,
        r.kost_id,
        r.tanggal_mulai,
        r.tanggal_selesai,
        r.durasi_bulan,
        r.total_harga,
        r.status,
        r.status_pembayaran,
        r.catatan,
        r.created_at,
        k.nama AS nama_kost,
        k.alamat,
        k.harga,
        k.deskripsi,
        k.fasilitas,
        k.status AS status_kost,
        k.gambar
       FROM reservasi r
       LEFT JOIN kost k ON r.kost_id = k.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    console.log('Reservasi found:', reservasiResult.length);

    // Format data untuk response
    const formattedData = reservasiResult.map((item: any) => ({
      id: item.id,
      reservasi_id: item.id,
      user_id: item.user_id,
      kost_id: item.kost_id,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      durasi_bulan: item.durasi_bulan,
      total_biaya: item.total_harga,
      status: item.status,
      status_pembayaran: item.status_pembayaran || 'belum_bayar',
      catatan: item.catatan,
      created_at: item.created_at,
      // Detail kost
      nama_kost: item.nama_kost,
      alamat_kost: item.alamat,
      kelas_kamar: item.nama_kost, // Pakai nama_kost karena tidak ada kolom kelas
      harga: item.harga, // Ini sudah benar
      deskripsi: item.deskripsi,
      fasilitas: item.fasilitas,
      status_kost: item.status_kost,
      gambar_kost: item.gambar,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
        count: formattedData.length,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching reservasi:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data reservasi',
        message: error.message,
      },
      { status: 500 }
    );
  }
}