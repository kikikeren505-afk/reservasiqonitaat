import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/kost/' + params.id);

    const { data: kost, error } = await supabase
      .from('kost')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !kost) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('✅ Kost found:', kost.id);

    return NextResponse.json(
      {
        message: 'Detail kost berhasil diambil',
        data: kost
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Get kost detail error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}