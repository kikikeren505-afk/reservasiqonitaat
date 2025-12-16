// Lokasi: app/api/users/[id]/route.ts

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
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const users: any = await query(
      'SELECT id, nama_lengkap, nomor_hp, alamat, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
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
        message: 'Failed to fetch user',
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
        { success: false, message: 'User ID is required' },
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

    // Update user data
    const result: any = await query(
      `UPDATE users 
       SET nama_lengkap = ?, nomor_hp = ?, alamat = ?
       WHERE id = ?`,
      [nama_lengkap, nomor_hp, alamat, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found or no changes made' },
        { status: 404 }
      );
    }

    // Get updated user data
    const updatedUsers: any = await query(
      'SELECT id, nama_lengkap, nomor_hp, alamat, email, role FROM users WHERE id = ?',
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
        message: 'Failed to update user',
        error: error.message,
      },
      { status: 500 }
    );
  }
}