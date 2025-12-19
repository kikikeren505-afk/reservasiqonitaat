// Lokasi: app/api/admin/kost/[id]/route.ts

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

    const kosts: any = await query(
      'SELECT * FROM kost WHERE id = ?',
      [kostId]
    );

    if (!kosts || kosts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Kost not found' },
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
        message: 'Failed to fetch kost',
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

    // Update kost
    const result: any = await query(
      `UPDATE kost 
       SET nama = ?, alamat = ?, harga = ?, deskripsi = ?, fasilitas = ?, status = ?
       WHERE id = ?`,
      [nama, alamat, harga, deskripsi, fasilitas, status, kostId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Kost not found' },
        { status: 404 }
      );
    }

    // Clear cache untuk semua halaman yang menampilkan data kost
    revalidatePath('/admin/kost');
    revalidatePath('/admin/kost/' + kostId);
    revalidatePath('/kost');
    console.log('✅ Cache cleared for kost pages');

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
        message: 'Failed to update kost',
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
    const reservations: any = await query(
      `SELECT COUNT(*) as count FROM reservasi 
       WHERE kost_id = ? AND status IN ('pending', 'confirmed')`,
      [kostId]
    );

    if (reservations[0].count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tidak dapat menghapus kost yang memiliki reservasi aktif' 
        },
        { status: 400 }
      );
    }

    // Delete kost
    const result: any = await query(
      'DELETE FROM kost WHERE id = ?',
      [kostId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Kost not found' },
        { status: 404 }
      );
    }

    // Clear cache setelah delete
    revalidatePath('/admin/kost');
    revalidatePath('/kost');
    console.log('✅ Cache cleared after delete');

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
        message: 'Failed to delete kost',
        error: error.message,
      },
      { status: 500 }
    );
  }
}