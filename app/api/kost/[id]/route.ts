import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kost = await queryOne(
      'SELECT * FROM Data_Kost WHERE Kost_id = ?',
      [params.id]
    );

    if (!kost) {
      return NextResponse.json(
        { message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Detail kost berhasil diambil',
        data: kost
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get kost detail error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}