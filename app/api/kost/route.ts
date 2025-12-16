import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all kost data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'tersedia';

    const kosts: any = await query(
      `SELECT dk.*, 
              GROUP_CONCAT(DISTINCT k.Kategori_id) as kategori_ids,
              GROUP_CONCAT(DISTINCT k.Harga) as harga_list,
              GROUP_CONCAT(DISTINCT k.Ukuran_kamar) as ukuran_list,
              GROUP_CONCAT(DISTINCT k.Fasilitas) as fasilitas_list
       FROM Data_Kost dk
       LEFT JOIN Kategori k ON dk.Kost_id = k.Kost_id
       WHERE LOWER(dk.Status) = LOWER(?)
       GROUP BY dk.Kost_id
       ORDER BY dk.Kost_id DESC`,
      [status]
    );

    return NextResponse.json(
      {
        message: 'Data kost berhasil diambil',
        data: kosts
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get kost error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST create new kost (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_kost, alamat_kost, deskripsi, status } = body;

    if (!nama_kost || !alamat_kost) {
      return NextResponse.json(
        { message: 'Nama kost dan alamat harus diisi' },
        { status: 400 }
      );
    }

    const result: any = await query(
      `INSERT INTO Data_Kost (Nama_kost, Alamat_kost, Deskripsi, Status) 
       VALUES (?, ?, ?, ?)`,
      [nama_kost, alamat_kost, deskripsi || '', status || 'tersedia']
    );

    if (result.insertId) {
      return NextResponse.json(
        {
          message: 'Kost berhasil ditambahkan',
          kost_id: result.insertId
        },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to create kost');
    }

  } catch (error) {
    console.error('Create kost error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}