import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_lengkap, password, confirmPassword, alamat, nomor_hp, email } = body;

    console.log('📝 Register attempt:', { email, nomor_hp });

    // Validasi input
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

    // Cek apakah user sudah ada
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},nomor_hp.eq.${nomor_hp}`)
      .limit(1);

    if (checkError) {
      console.error('❌ Check user error:', checkError);
      return NextResponse.json(
        { message: "Terjadi kesalahan saat memeriksa data" },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️ User already exists:', existingUsers[0]);
      return NextResponse.json(
        { message: "Email atau nomor HP sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          nama_lengkap,
          email,
          nomor_hp,
          alamat,
          password: hashedPassword,
          role: 'user'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert user error:', insertError);
      return NextResponse.json(
        { message: "Gagal mendaftarkan user: " + insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ User registered:', newUser.id);

    return NextResponse.json(
      {
        message: "Registrasi berhasil! Silakan login.",
        user_id: newUser.id,
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error("❌ Register error:", error);
    return NextResponse.json(
      { 
        message: "Terjadi kesalahan server",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}