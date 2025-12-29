import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log('🔐 Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // ✅ Query dengan Supabase REST API
    console.log('📊 Querying Supabase via REST API...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found');
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log('✅ User found:', user.email);

    // Verifikasi password
    let isPasswordValid = false;

    if (user.password?.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const userData = {
      id: user.id,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      nomor_hp: user.nomor_hp,
      alamat: user.alamat,
      role: user.role,
      level_name: user.role === 'admin' ? 'Administrator' : 'User',
    };

    console.log('✅ Login success:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: userData,
    });

  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}