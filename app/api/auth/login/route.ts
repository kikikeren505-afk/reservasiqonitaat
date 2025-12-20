// Lokasi: app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    console.log('Login attempt for email:', body.email);

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // ✅ POSTGRESQL PARAM ($1)
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    let isPasswordValid = false;

    if (user.password.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        nomor_hp: user.nomor_hp,
        alamat: user.alamat,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
