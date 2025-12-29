// app/api/admin/stats/route.ts
// VERSION: Admin Client (Bypass RLS) - FINAL FIX

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase'; // ← PAKAI ADMIN CLIENT!

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('🔍 ===== STATS API CALLED (ADMIN CLIENT - BYPASS RLS) =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🔐 Using: ADMIN CLIENT (Service Role Key)');

    // Total Users - Direct Query with Admin
    console.log('⏳ Counting users (admin client)...');
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('❌ Users count error:', usersError);
      throw usersError;
    }
    console.log('✅ Total Users:', totalUsers);

    // Total Kost - Direct Query with Admin
    console.log('⏳ Counting kost (admin client)...');
    const { count: totalKost, error: kostError } = await supabaseAdmin
      .from('kost')
      .select('*', { count: 'exact', head: true });
    
    if (kostError) {
      console.error('❌ Kost count error:', kostError);
      throw kostError;
    }
    console.log('✅ Total Kost:', totalKost);

    // Total Reservasi - Direct Query with Admin (BYPASS RLS!)
    console.log('⏳ Counting ALL reservasi (admin client - BYPASS RLS)...');
    const { count: totalReservasi, error: reservasiError } = await supabaseAdmin
      .from('reservasi')
      .select('*', { count: 'exact', head: true });
    
    if (reservasiError) {
      console.error('❌ Reservasi count error:', reservasiError);
      throw reservasiError;
    }
    console.log('✅ Total Reservasi:', totalReservasi);

    // Reservasi Pending - Direct Query with Admin
    console.log('⏳ Counting pending reservasi (admin client)...');
    const { count: reservasiPending, error: pendingError } = await supabaseAdmin
      .from('reservasi')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (pendingError) {
      console.error('❌ Pending count error:', pendingError);
      throw pendingError;
    }
    console.log('✅ Reservasi Pending:', reservasiPending);

    // Reservasi Confirmed - Direct Query with Admin
    console.log('⏳ Counting confirmed reservasi (admin client)...');
    const { count: reservasiConfirmed, error: confirmedError } = await supabaseAdmin
      .from('reservasi')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');
    
    if (confirmedError) {
      console.error('❌ Confirmed count error:', confirmedError);
      throw confirmedError;
    }
    console.log('✅ Reservasi Confirmed:', reservasiConfirmed);

    // Reservasi Completed - Direct Query with Admin
    console.log('⏳ Counting completed reservasi (admin client)...');
    const { count: reservasiCompleted, error: completedError } = await supabaseAdmin
      .from('reservasi')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');
    
    if (completedError) {
      console.error('❌ Completed count error:', completedError);
      throw completedError;
    }
    console.log('✅ Reservasi Completed:', reservasiCompleted);

    // Kost Tersedia - Direct Query with Admin
    console.log('⏳ Counting kost tersedia (admin client)...');
    const { count: kostTersedia, error: tersediaError } = await supabaseAdmin
      .from('kost')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'tersedia');
    
    if (tersediaError) {
      console.error('❌ Kost tersedia count error:', tersediaError);
      throw tersediaError;
    }
    console.log('✅ Kost Tersedia:', kostTersedia);

    const stats = {
      totalUsers: totalUsers || 0,
      totalKost: totalKost || 0,
      totalReservasi: totalReservasi || 0,
      reservasiPending: reservasiPending || 0,
      reservasiConfirmed: reservasiConfirmed || 0,
      reservasiCompleted: reservasiCompleted || 0,
      kostTersedia: kostTersedia || 0,
    };

    console.log('📊 ===== FINAL STATS OBJECT (WITH ADMIN CLIENT) =====');
    console.log(JSON.stringify(stats, null, 2));
    console.log('🎯 Verification:');
    console.log(`   Pending + Confirmed + Completed = ${reservasiPending} + ${reservasiConfirmed} + ${reservasiCompleted} = ${(reservasiPending || 0) + (reservasiConfirmed || 0) + (reservasiCompleted || 0)}`);
    console.log(`   Should equal Total Reservasi: ${totalReservasi}`);
    console.log('✅ RLS BYPASSED: Using service_role key');
    console.log('🔍 ===== END STATS API =====');

    return NextResponse.json(
      {
        success: true,
        data: stats,
        debug: {
          using_admin_client: true,
          rls_bypassed: true,
          timestamp: new Date().toISOString()
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        }
      }
    );

  } catch (error: any) {
    console.error('❌ ===== STATS API ERROR =====');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
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