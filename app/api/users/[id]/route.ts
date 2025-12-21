// Lokasi: app/api/users/[id]/route.ts
// ✅ DIPERBAIKI: Ganti semua placeholder MySQL (?) ke PostgreSQL ($1, $2, dst)

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET user by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // DIPERBAIKI: Ganti ? ke $1
    const users: any = await query(
      'SELECT id, nama_lengkap, nomor_hp, alamat, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: users[0],
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data user',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await req.json();

    console.log('Updating user:', userId, 'with data:', body);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    const { nama_lengkap, nomor_hp, alamat } = body;

    // Validasi input
    if (!nama_lengkap || !nomor_hp || !alamat) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // DIPERBAIKI: Ganti ? ke $1, $2, $3, $4 + gunakan RETURNING
    // Update user data
    const result: any = await query(
      `UPDATE users 
       SET nama_lengkap = $1, nomor_hp = $2, alamat = $3
       WHERE id = $4
       RETURNING id`,
      [nama_lengkap, nomor_hp, alamat, userId]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan atau tidak ada perubahan' },
        { status: 404 }
      );
    }

    // DIPERBAIKI: Ganti ? ke $1
    // Get updated user data
    const updatedUsers: any = await query(
      'SELECT id, nama_lengkap, nomor_hp, alamat, email, role FROM users WHERE id = $1',
      [userId]
    );

    console.log('User updated successfully:', updatedUsers[0]);

    return NextResponse.json(
      {
        success: true,
        message: 'Profil berhasil diperbarui',
        data: updatedUsers[0],
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengupdate user',
        error: error.message,
      },
      { status: 500 }
    );
  }
}