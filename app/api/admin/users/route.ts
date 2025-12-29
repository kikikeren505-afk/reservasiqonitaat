// Lokasi: app/api/admin/users/route.ts
// VERSION: Admin Client (Bypass RLS)

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase'; // ← GANTI DARI supabase MENJADI supabaseAdmin

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('🔍 ===== GET /api/admin/users =====');
    console.log('🔐 Using: ADMIN CLIENT (Service Role Key)');

    // Query users dengan supabaseAdmin (BYPASS RLS)
    const { data: usersData, error } = await supabaseAdmin
      .from('users')
      .select('id, nama_lengkap, nomor_hp, alamat, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Users found:', usersData?.length || 0);
    console.log('✅ RLS BYPASSED - All users fetched!');

    return NextResponse.json(
      {
        success: true,
        data: usersData || [],
        count: usersData?.length || 0,
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
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}