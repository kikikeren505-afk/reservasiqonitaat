// Lokasi: app/api/reservasi/user/[userId]/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Query reservasi user beserta detail kost
    const { data: reservasiResult, error } = await supabase
      .from('reservasi')
      .select(`
        id,
        user_id,
        kost_id,
        tanggal_mulai,
        tanggal_selesai,
        durasi_bulan,
        total_harga,
        status,
        status_pembayaran,
        catatan,
        created_at,
        kost:kost_id (
          nama,
          alamat,
          harga,
          deskripsi,
          fasilitas,
          status,
          gambar
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Reservasi found:', reservasiResult?.length || 0);

    // Format data untuk response
    const formattedData = reservasiResult?.map((item: any) => ({
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
      nama_kost: item.kost?.nama || null,
      alamat_kost: item.kost?.alamat || null,
      kelas_kamar: item.kost?.nama || null,
      harga: item.kost?.harga || null,
      deskripsi: item.kost?.deskripsi || null,
      fasilitas: item.kost?.fasilitas || null,
      status_kost: item.kost?.status || null,
      gambar_kost: item.kost?.gambar || null,
    })) || [];

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
        count: formattedData.length,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching reservasi:', error);
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