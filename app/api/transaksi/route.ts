import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET user transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    const transaksi: any = await query(
      `SELECT t.*, k.Harga, k.Ukuran_kamar, k.Fasilitas,
              dk.Nama_kost, dk.Alamat_kost
       FROM Transaksi t
       LEFT JOIN Kategori k ON t.Kamar_id = k.Kategori_id
       LEFT JOIN Data_Kost dk ON k.Kost_id = dk.Kost_id
       WHERE t.User_id = ?
       ORDER BY t.Tanggal_mulai DESC`,
      [userId]
    );

    return NextResponse.json(
      {
        message: 'Data transaksi berhasil diambil',
        data: transaksi
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get transaksi error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST create new transaction/reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, kamar_id, tanggal_mulai, status } = body;

    // Validation
    if (!user_id || !kamar_id || !tanggal_mulai) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if room is available
    const kategori: any = await queryOne(
      'SELECT * FROM Kategori WHERE Kategori_id = ?',
      [kamar_id]
    );

    if (!kategori) {
      return NextResponse.json(
        { message: 'Kamar tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check existing active reservations
    const existingReservation = await queryOne(
      `SELECT * FROM Transaksi 
       WHERE Kamar_id = ? AND Status IN ('pending', 'aktif')`,
      [kamar_id]
    );

    if (existingReservation) {
      return NextResponse.json(
        { message: 'Kamar sudah dipesan' },
        { status: 409 }
      );
    }

    // Create transaction
    const result: any = await query(
      `INSERT INTO Transaksi (User_id, Kamar_id, Tanggal_mulai, Status) 
       VALUES (?, ?, ?, ?)`,
      [user_id, kamar_id, tanggal_mulai, status || 'pending']
    );

    if (result.insertId) {
      return NextResponse.json(
        {
          message: 'Reservasi berhasil dibuat',
          transaksi_id: result.insertId
        },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to create transaction');
    }

  } catch (error) {
    console.error('Create transaksi error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT update transaction status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaksi_id, status } = body;

    if (!transaksi_id || !status) {
      return NextResponse.json(
        { message: 'ID transaksi dan status diperlukan' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE Transaksi SET Status = ? WHERE Transaksi_id = ?',
      [status, transaksi_id]
    );

    return NextResponse.json(
      { message: 'Status transaksi berhasil diupdate' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update transaksi error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}