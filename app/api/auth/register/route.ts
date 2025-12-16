import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_lengkap, password, confirmPassword, alamat, nomor_hp, email } = body;

    // Validasi
    if (!nama_lengkap || !password || !confirmPassword || !alamat || !nomor_hp || !email) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Password dan konfirmasi password tidak sama" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Cek user sudah ada atau belum
    const existingUser = await queryOne(
      "SELECT id FROM users WHERE email = ? OR nomor_hp = ?",
      [email, nomor_hp]
    );

    if (existingUser) {
      return NextResponse.json(
        { message: "Email atau nomor HP sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const result: any = await query(
      `INSERT INTO users (nama_lengkap, email, nomor_hp, alamat, password, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nama_lengkap, email, nomor_hp, alamat, hashedPassword, 'user']
    );

    return NextResponse.json(
      {
        message: "Registrasi berhasil! Silakan login.",
        user_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}