import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Fetching kategori for kost_id:', params.id);

    // ✅ Query dengan Supabase
    const { data: kategori, error } = await supabase
      .from('Kategori')
      .select('*')
      .eq('Kost_id', params.id)
      .order('Harga', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { message: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${kategori?.length || 0} kategori`);

    return NextResponse.json(
      {
        message: 'Data kategori berhasil diambil',
        data: kategori || []
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Get kategori error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}