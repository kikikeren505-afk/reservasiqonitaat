// Lokasi: app/api/reservasi/route.ts
// ✅ TAMBAHKAN: Auto kirim WhatsApp saat reservasi baru

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { notifyAdminNewReservation } from '@/lib/whatsapp';

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

    const result: any = await query(
      `INSERT INTO reservasi 
       (user_id, kost_id, tanggal_mulai, tanggal_selesai, durasi_bulan, total_harga, status, catatan)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
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

    if (result.insertId) {
      revalidatePath('/dashboard/reservasi');
      console.log('✅ Cache cleared for dashboard reservasi');

      // ✅ KIRIM WHATSAPP KE ADMIN
      try {
        // Get customer name and kost name
        const reservasiDetail: any = await query(
          `SELECT 
            u.nama_lengkap as customer_name,
            k.nama as kost_name
          FROM reservasi r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN kost k ON r.kost_id = k.id
          WHERE r.id = ?`,
          [result.insertId]
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
          
          console.log('✅ WhatsApp notification sent to admin');
        }
      } catch (waError) {
        console.error('⚠️ Failed to send WhatsApp (non-blocking):', waError);
        // Don't fail the whole request if WA fails
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Reservasi berhasil dibuat',
          data: {
            id: result.insertId,
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
      throw new Error('Failed to create reservasi');
    }

  } catch (error: any) {
    console.error('Error creating reservasi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create reservasi',
        error: error.message,
      },
      { status: 500 }
    );
  }
}