// ========================================
// FILE: app/api/admin/reservasi/route.ts
// FINAL FIX: Gunakan supabaseAdmin untuk bypass RLS
// ========================================
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase'; // ← GANTI KE ADMIN CLIENT!

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('✅ Fetching all reservasi from Supabase (ADMIN CLIENT - BYPASS RLS)...');
    
    // ✅ FIXED: Gunakan supabaseAdmin + LEFT JOIN
    const { data: reservasiList, error } = await supabaseAdmin
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
        users:user_id!left (
          id,
          nama_lengkap,
          email
        ),
        kost:kost_id!left (
          id,
          nama,
          alamat
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Reservasi found: ${reservasiList?.length || 0}`);
    console.log('✅ RLS BYPASSED - All data fetched!');
    
    if (reservasiList && reservasiList.length > 0) {
      console.log('📋 Sample raw data:', JSON.stringify(reservasiList[0], null, 2));
    }

    // Format data untuk frontend
    const formattedData = reservasiList?.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      kost_id: item.kost_id,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      durasi_bulan: item.durasi_bulan,
      total_harga: item.total_harga,
      status: item.status,
      catatan: item.catatan,
      created_at: item.created_at,
      nama_user: item.users?.nama_lengkap || 'N/A',
      email_user: item.users?.email || 'N/A',
      nama_kost: item.kost?.nama || 'N/A',
      alamat_kost: item.kost?.alamat || 'N/A',
    })) || [];

    console.log(`✅ Formatted data: ${formattedData.length}`);
    if (formattedData.length > 0) {
      console.log('📋 Sample formatted:', JSON.stringify(formattedData[0], null, 2));
    }

    // Log status distribution
    const statusCount = formattedData.reduce((acc: any, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Status distribution:', statusCount);

    return NextResponse.json({
      success: true,
      data: formattedData
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching reservasi:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}