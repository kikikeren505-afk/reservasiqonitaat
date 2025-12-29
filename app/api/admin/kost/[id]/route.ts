// Lokasi: app/api/admin/kost/[id]/route.ts

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

// GET - Ambil detail kost by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kostId = params.id;
    console.log('GET /api/admin/kost/' + kostId);

    const { data: kost, error } = await supabase
      .from('kost')
      .select('*')
      .eq('id', kostId)
      .single();

    if (error || !kost) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('✅ Kost found:', kost.id);

    return NextResponse.json(
      {
        success: true,
        data: kost,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching kost:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data kost',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update kost
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kostId = params.id;
    const body = await req.json();
    console.log('PUT /api/admin/kost/' + kostId, body);

    const { nama, alamat, harga, deskripsi, fasilitas, status } = body;

    // Validasi
    if (!nama || !alamat || !harga || !deskripsi || !fasilitas || !status) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Update kost menggunakan Supabase
    const { data: updatedKost, error } = await supabase
      .from('kost')
      .update({
        nama,
        alamat,
        harga,
        deskripsi,
        fasilitas,
        status
      })
      .eq('id', kostId)
      .select()
      .single();

    if (error || !updatedKost) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('✅ Kost updated:', updatedKost.id);

    // Clear cache untuk semua halaman yang menampilkan data kost
    revalidatePath('/admin/kost');
    revalidatePath('/admin/kost/' + kostId);
    revalidatePath('/kost');
    console.log('✅ Cache dibersihkan untuk halaman kost');

    return NextResponse.json(
      {
        success: true,
        message: 'Kost berhasil diupdate',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error updating kost:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengupdate kost',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus kost
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kostId = params.id;
    console.log('DELETE /api/admin/kost/' + kostId);

    // Check if kost has active reservations
    const { count, error: countError } = await supabase
      .from('reservasi')
      .select('*', { count: 'exact', head: true })
      .eq('kost_id', kostId)
      .in('status', ['pending', 'confirmed']);

    if (countError) {
      console.error('❌ Supabase error:', countError);
      throw new Error(countError.message);
    }

    if (count && count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tidak dapat menghapus kost yang memiliki reservasi aktif' 
        },
        { status: 400 }
      );
    }

    // Delete kost
    const { error: deleteError } = await supabase
      .from('kost')
      .delete()
      .eq('id', kostId);

    if (deleteError) {
      console.error('❌ Supabase error:', deleteError);
      throw new Error(deleteError.message);
    }

    console.log('✅ Kost deleted:', kostId);

    // Clear cache setelah delete
    revalidatePath('/admin/kost');
    revalidatePath('/kost');
    console.log('✅ Cache dibersihkan setelah delete');

    return NextResponse.json(
      {
        success: true,
        message: 'Kost berhasil dihapus',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error deleting kost:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus kost',
        error: error.message,
      },
      { status: 500 }
    );
  }
}