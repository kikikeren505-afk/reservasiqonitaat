// Lokasi: app/api/reservasi/route.ts
// ✅ DIPERBAIKI: Sesuaikan dengan lib/db.ts yang return rows langsung

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { notifyAdminNewReservation } from '@/lib/whatsapp';

// ✅ Tambahkan ini untuk fix dynamic server error
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    console.log('GET /api/reservasi - user_id:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // query() sudah return rows langsung
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
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC`,
      [userId]
    );

    console.log('Reservasi ditemukan:', reservasiData?.length || 0);

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
        message: 'Gagal mengambil data reservasi',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('POST /api/reservasi - data:', body);

    const {
      user_id,
      kost_id,
      tanggal_mulai,
      durasi_bulan,
      total_harga,
      catatan
    } = body;

    if (!user_id || !kost_id || !tanggal_mulai || !durasi_bulan || !total_harga) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib harus diisi' },
        { status: 400 }
      );
    }

    const startDate = new Date(tanggal_mulai);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(durasi_bulan));

    const tanggalMulaiFormatted = startDate.toISOString().split('T')[0];
    const tanggalSelesaiFormatted = endDate.toISOString().split('T')[0];

    // query() sudah return rows langsung, pakai RETURNING id
    const result: any = await query(
      `INSERT INTO reservasi 
       (user_id, kost_id, tanggal_mulai, tanggal_selesai, durasi_bulan, total_harga, status, catatan)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
       RETURNING id`,
      [
        user_id,
        kost_id,
        tanggalMulaiFormatted,
        tanggalSelesaiFormatted,
        durasi_bulan,
        total_harga,
        catatan || null
      ]
    );

    const insertedId = result[0]?.id;

    if (insertedId) {
      revalidatePath('/dashboard/reservasi');
      console.log('✅ Cache dibersihkan untuk dashboard reservasi');

      // ✅ KIRIM WHATSAPP KE ADMIN
      try {
        // query() sudah return rows langsung
        const reservasiDetail: any = await query(
          `SELECT 
            u.nama_lengkap as customer_name,
            k.nama as kost_name
          FROM reservasi r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN kost k ON r.kost_id = k.id
          WHERE r.id = $1`,
          [insertedId]
        );

        if (reservasiDetail && reservasiDetail.length > 0) {
          const detail = reservasiDetail[0];
          
          await notifyAdminNewReservation({
            customerName: detail.customer_name || 'Unknown',
            kostName: detail.kost_name || 'Unknown',
            tanggalMulai: tanggalMulaiFormatted,
            durasi: durasi_bulan,
            totalHarga: total_harga,
          });
          
          console.log('✅ Notifikasi WhatsApp terkirim ke admin');
        }
      } catch (waError) {
        console.error('⚠️ Gagal mengirim WhatsApp (non-blocking):', waError);
        // Jangan gagalkan request jika WA gagal
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Reservasi berhasil dibuat',
          data: {
            id: insertedId,
            user_id,
            kost_id,
            tanggal_mulai: tanggalMulaiFormatted,
            tanggal_selesai: tanggalSelesaiFormatted,
            durasi_bulan,
            total_harga,
            status: 'pending'
          }
        },
        { status: 201 }
      );
    } else {
      throw new Error('Gagal membuat reservasi');
    }

  } catch (error: any) {
    console.error('Error creating reservasi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal membuat reservasi',
        error: error.message,
      },
      { status: 500 }
    );
  }
}