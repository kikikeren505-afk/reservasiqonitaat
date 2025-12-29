import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Query total reservasi user
    const { count: totalReservasi, error: error1 } = await supabase
      .from('reservasi')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error1) throw error1;

    // Query reservasi aktif (status pending atau confirmed)
    const { count: reservasiAktif, error: error2 } = await supabase
      .from('reservasi')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed']);

    if (error2) throw error2;

    // Query kost tersedia
    const { count: kostTersedia, error: error3 } = await supabase
      .from('kost')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'tersedia');

    if (error3) throw error3;

    const stats = {
      totalReservasi: totalReservasi || 0,
      reservasiAktif: reservasiAktif || 0,
      kostTersedia: kostTersedia || 0,
    };

    console.log('✅ Dashboard stats:', stats);

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error);
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
