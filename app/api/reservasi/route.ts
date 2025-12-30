// Lokasi: app/api/reservasi/route.ts - ADMIN VERSION

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { notifyAdminNewReservation } from '@/lib/whatsapp';

// ✅ Gunakan Service Role Key untuk bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
);

// ✅ Dynamic route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id'); // Optional filter

    console.log('GET /api/reservasi - user_id:', userId);

    // ✅ Query SEMUA reservasi (atau filter by user_id jika ada)
    let query = supabaseAdmin
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
        users:user_id (
          nama_lengkap,
          email
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
      .order('created_at', { ascending: false });

    // ✅ Filter by user_id hanya jika parameter ada
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: reservasiData, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    // Transform data
    const transformedData = reservasiData?.map((item: any) => {
      const sortedPayments = item.pembayaran?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];

      return {
        ...item,
        nama_kost: item.kost?.nama || null,
        alamat_kost: item.kost?.alamat || null,
        harga_kost: item.kost?.harga || null,
        nama_user: item.users?.nama_lengkap || null,
        email_user: item.users?.email || null,
        pembayaran: sortedPayments
      };
    }) || [];

    console.log('✅ Reservasi ditemukan:', transformedData.length);

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

    // Insert menggunakan service role key
    const { data: newReservasi, error } = await supabaseAdmin
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

    // ✅ Kirim WhatsApp notifikasi
    try {
      const { data: reservasiDetail } = await supabaseAdmin
        .from('reservasi')
        .select(`
          users:user_id (nama_lengkap),
          kost:kost_id (nama)
        `)
        .eq('id', insertedId)
        .single();

      if (reservasiDetail) {
        await notifyAdminNewReservation({
          customerName: (reservasiDetail as any).users?.nama_lengkap || 'Unknown',
          kostName: (reservasiDetail as any).kost?.nama || 'Unknown',
          tanggalMulai: tanggalMulaiFormatted,
          durasi: durasi_bulan,
          totalHarga: total_harga,
        });
        
        console.log('✅ Notifikasi WhatsApp terkirim');
      }
    } catch (waError) {
      console.error('⚠️ Gagal mengirim WhatsApp:', waError);
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