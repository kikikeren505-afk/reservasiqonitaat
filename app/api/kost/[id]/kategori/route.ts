import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kategori = await query(
      'SELECT * FROM Kategori WHERE Kost_id = ? ORDER BY Harga ASC',
      [params.id]
    );

    return NextResponse.json(
      {
        message: 'Data kategori berhasil diambil',
        data: kategori
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get kategori error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}