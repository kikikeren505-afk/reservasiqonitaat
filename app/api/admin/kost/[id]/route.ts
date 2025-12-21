// Lokasi: app/api/admin/kost/[id]/route.ts
// ✅ DIPERBAIKI: Ganti semua placeholder MySQL (?) ke PostgreSQL ($1, $2, dst)

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

// GET - Ambil detail kost by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kostId = params.id;
    console.log('GET /api/admin/kost/' + kostId);

    // DIPERBAIKI: Ganti ? ke $1
    const kosts: any = await query(
      'SELECT * FROM kost WHERE id = $1',
      [kostId]
    );

    if (!kosts || kosts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: kosts[0],
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching kost:', error);
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

    // DIPERBAIKI: Ganti ? ke $1, $2, $3, dst + gunakan RETURNING untuk PostgreSQL
    const result: any = await query(
      `UPDATE kost 
       SET nama = $1, alamat = $2, harga = $3, deskripsi = $4, fasilitas = $5, status = $6
       WHERE id = $7
       RETURNING id`,
      [nama, alamat, harga, deskripsi, fasilitas, status, kostId]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

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
    console.error('Error updating kost:', error);
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

    // DIPERBAIKI: Ganti ? ke $1
    // Check if kost has active reservations
    const reservations: any = await query(
      `SELECT COUNT(*) as count FROM reservasi 
       WHERE kost_id = $1 AND status IN ('pending', 'confirmed')`,
      [kostId]
    );

    if (parseInt(reservations[0]?.count) > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tidak dapat menghapus kost yang memiliki reservasi aktif' 
        },
        { status: 400 }
      );
    }

    // DIPERBAIKI: Ganti ? ke $1 + gunakan RETURNING untuk PostgreSQL
    // Delete kost
    const result: any = await query(
      'DELETE FROM kost WHERE id = $1 RETURNING id',
      [kostId]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

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
    console.error('Error deleting kost:', error);
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