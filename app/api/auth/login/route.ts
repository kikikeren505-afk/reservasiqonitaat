// Lokasi: app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log('Login attempt for email:', email);

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // ✅ POSTGRES PLACEHOLDER ($1)
    const users: any[] = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verifikasi password
    let isPasswordValid = false;

    if (user.password?.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // fallback (testing only)
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Response TANPA password
    const userData = {
      id: user.id,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      nomor_hp: user.nomor_hp,
      alamat: user.alamat,
      role: user.role,
      level_name: user.role === 'admin' ? 'Administrator' : 'User',
    };

    console.log('Login success:', user.email);

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
      },
      { status: 500 }
    );
  }
}
