// Lokasi: app/api/admin/kost/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Ambil semua kost
export async function GET(req: Request) {
  try {
    console.log('GET /api/admin/kost');

    const kosts: any = await query(
      'SELECT * FROM kost ORDER BY created_at DESC'
    );

    return NextResponse.json(
      {
        success: true,
        data: kosts || [],
        count: kosts?.length || 0,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching kosts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch kosts',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Tambah kost baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('POST /api/admin/kost - data:', body);

    const { nama, alamat, harga, deskripsi, fasilitas, status } = body;

    // Validasi
    if (!nama || !alamat || !harga || !deskripsi || !fasilitas || !status) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Insert kost
    const result: any = await query(
      `INSERT INTO kost (nama, alamat, harga, deskripsi, fasilitas, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nama, alamat, harga, deskripsi, fasilitas, status]
    );

    console.log('Kost created with ID:', result.insertId);

    return NextResponse.json(
      {
        success: true,
        message: 'Kost berhasil ditambahkan',
        data: { id: result.insertId },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating kost:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create kost',
        error: error.message,
      },
      { status: 500 }
    );
  }
}