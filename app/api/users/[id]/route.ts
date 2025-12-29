import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama_lengkap, nomor_hp, alamat, email, role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.id);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching user:', error);
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

    // Update user data
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        nama_lengkap,
        nomor_hp,
        alamat
      })
      .eq('id', userId)
      .select('id, nama_lengkap, nomor_hp, alamat, email, role')
      .single();

    if (error || !updatedUser) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan atau tidak ada perubahan' },
        { status: 404 }
      );
    }

    console.log('✅ User updated successfully:', updatedUser);

    return NextResponse.json(
      {
        success: true,
        message: 'Profil berhasil diperbarui',
        data: updatedUser,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error updating user:', error);
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