// Lokasi: app/api/reservasi/route.ts - FIXED VERSION

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
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

    // ✅ FIXED: Query reservasi dengan JOIN ke kost DAN pembayaran
    const { data: reservasiData, error } = await supabase
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
        catatan,
        created_at,
        kost:kost_id (
          nama,
          alamat,
          harga
        ),
        pembayaran!pembayaran_reservasi_id_fkey (
          id,
          status,
          metode_pembayaran,
          bukti_pembayaran,
          keterangan,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    // Transform data untuk match format lama
    const transformedData = reservasiData?.map((item: any) => {
      // Sort pembayaran by created_at descending (terbaru dulu)
      const sortedPayments = item.pembayaran?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];

      return {
        ...item,
        nama_kost: item.kost?.nama || null,
        alamat_kost: item.kost?.alamat || null,
        harga_kost: item.kost?.harga || null,
        // ✅ Pembayaran sudah otomatis ada karena JOIN di atas, sorted by newest
        pembayaran: sortedPayments
      };
    }) || [];

    console.log('✅ Reservasi ditemukan:', transformedData.length);
    console.log('📦 Data dengan pembayaran:', JSON.stringify(transformedData, null, 2));

    return NextResponse.json(
      {
        success: true,
        data: transformedData,
        count: transformedData.length,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching reservasi:', error);
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

    // Insert reservasi menggunakan Supabase
    const { data: newReservasi, error } = await supabase
      .from('reservasi')
      .insert({
        user_id,
        kost_id,
        tanggal_mulai: tanggalMulaiFormatted,
        tanggal_selesai: tanggalSelesaiFormatted,
        durasi_bulan,
        total_harga,
        status: 'pending',
        catatan: catatan || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    const insertedId = newReservasi.id;
    console.log('✅ Reservasi created:', insertedId);

    revalidatePath('/dashboard/reservasi');
    console.log('✅ Cache dibersihkan untuk dashboard reservasi');

    // ✅ KIRIM WHATSAPP KE ADMIN
    try {
      // Query detail untuk WhatsApp notification
      const { data: reservasiDetail, error: detailError } = await supabase
        .from('reservasi')
        .select(`
          users:user_id (
            nama_lengkap
          ),
          kost:kost_id (
            nama
          )
        `)
        .eq('id', insertedId)
        .single();

      if (!detailError && reservasiDetail) {
        await notifyAdminNewReservation({
          customerName: (reservasiDetail as any).users?.nama_lengkap || 'Unknown',
          kostName: (reservasiDetail as any).kost?.nama || 'Unknown',
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

  } catch (error: any) {
    console.error('❌ Error creating reservasi:', error);
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