// Lokasi: app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Login attempt for email:', body.email);

    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Query user dari database
    const users: any = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log('User found:', user.email);

    // Verifikasi password
    // Support both bcrypt hash and plain text for testing
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2')) {
      // Bcrypt hash
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text (for testing only)
      isPasswordValid = password === user.password;
    }
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Return data user (TANPA password)
    const userData = {
      id: user.id,
      email: user.email,
      nama: user.nama_lengkap,
      nama_lengkap: user.nama_lengkap,
      nomor_hp: user.nomor_hp,
      no_hp: user.nomor_hp,
      alamat: user.alamat,
      role: user.role,
      level_name: user.role === 'admin' ? 'Administrator' : 'User',
    };

    console.log('Login successful for user:', userData.email, 'ID:', userData.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Login berhasil',
        data: userData,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message,
      },
      { status: 500 }
    );
  }
}