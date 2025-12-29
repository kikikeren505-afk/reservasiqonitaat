// lib/supabase.ts - COMPLETE VERSION dengan Debug
// Real-time Support + Admin Client + Error Handling

import { createClient } from '@supabase/supabase-js';

// ✅ DEBUG: Log environment variables
console.log('🔍 ===== ENV VARIABLES CHECK =====');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...' || '❌ NOT FOUND');
console.log('🔍 ===== END ENV CHECK =====');

// ========================================
// VALIDATION
// ========================================
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL tidak ditemukan di .env.local!');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan di .env.local!');
}

// ========================================
// CLIENT UNTUK FRONTEND (dengan RLS)
// ========================================
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    // ✅ ENABLE REAL-TIME
    realtime: {
      params: {
        eventsPerSecond: 10, // Limit events untuk performa
      }
    },
    // ✅ KEEP-ALIVE CONNECTION
    global: {
      headers: {
        'Connection': 'keep-alive',
      },
    },
    // ✅ AUTH PERSISTENCE
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// ========================================
// CLIENT UNTUK BACKEND/ADMIN (BYPASS RLS)
// ========================================
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  // Prioritas: Service Role Key, fallback ke Anon Key jika tidak ada
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// ========================================
// LOGGING
// ========================================
console.log('✅ Supabase clients initialized');
console.log('📍 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('🔔 Real-time:', 'ENABLED');
console.log('🔐 Admin Client:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ ENABLED (Service Role)' : '⚠️ FALLBACK (Anon Key - RLS Active!)');

// Peringatan jika Service Role Key tidak ada
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY tidak ditemukan!');
  console.warn('⚠️ Admin client akan menggunakan Anon Key (data akan terfilter RLS)');
  console.warn('⚠️ Tambahkan SUPABASE_SERVICE_ROLE_KEY ke .env.local untuk bypass RLS');
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Test koneksi database
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('reservasi')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Database connection: OK');
    return { success: true, message: 'Connected' };
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Test koneksi admin client
 */
export async function testAdminConnection() {
  try {
    const { count, error } = await supabaseAdmin
      .from('reservasi')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Admin client connection: OK');
    console.log('📊 Total reservasi (bypass RLS):', count);
    return { success: true, count, message: 'Admin Connected' };
  } catch (error: any) {
    console.error('❌ Admin client connection failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Get Supabase client berdasarkan context
 * @param admin - true untuk bypass RLS, false untuk normal client
 */
export function getSupabaseClient(admin: boolean = false) {
  return admin ? supabaseAdmin : supabase;
}