import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Ambil semua metode pembayaran aktif
export async function GET(request: NextRequest) {
  try {
    const { data: methods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('type')
      .order('id');

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({ data: methods || [] });
  } catch (error: any) {
    console.error('❌ Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods', message: error.message },
      { status: 500 }
    );
  }
}
