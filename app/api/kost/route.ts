import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all kost data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'tersedia';

    console.log('GET /api/kost - status:', status);

    // Query kost dengan filter status
    const { data: kosts, error } = await supabase
      .from('kost')
      .select('*')
      .ilike('status', status)
      .order('id', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Kosts found:', kosts?.length || 0);

    return NextResponse.json(
      {
        message: 'Data kost berhasil diambil',
        data: kosts || []
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Get kost error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new kost (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_kost, alamat_kost, deskripsi, status } = body;

    if (!nama_kost || !alamat_kost) {
      return NextResponse.json(
        { message: 'Nama kost dan alamat harus diisi' },
        { status: 400 }
      );
    }

    // Insert kost baru menggunakan Supabase
    const { data: newKost, error } = await supabase
      .from('kost')
      .insert({
        nama: nama_kost,
        alamat: alamat_kost,
        deskripsi: deskripsi || '',
        status: status || 'tersedia'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Kost created:', newKost.id);

    return NextResponse.json(
      {
        message: 'Kost berhasil ditambahkan',
        kost_id: newKost.id
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Create kost error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}