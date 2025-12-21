// Lokasi: app/api/payments/submit/route.ts
// ✅ DIPERBAIKI: Ganti semua placeholder MySQL (?) ke PostgreSQL ($1, $2, dst)

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ✅ Tambahkan ini untuk fix dynamic server error
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const reservasiId = formData.get('reservasi_id') as string;
    const metodePembayaran = formData.get('metode_pembayaran') as string;
    const namaPengirim = formData.get('nama_pengirim') as string;
    const namaRekening = formData.get('nama_rekening') as string;
    const tanggalTransfer = formData.get('tanggal_transfer') as string;
    const buktiTransfer = formData.get('bukti_transfer') as File | null;

    console.log('POST /api/payments/submit - reservasi_id:', reservasiId);
    console.log('Metode pembayaran:', metodePembayaran);

    // Validasi
    if (!reservasiId || !metodePembayaran) {
      return NextResponse.json(
        { success: false, error: 'Reservasi ID dan metode pembayaran harus diisi' },
        { status: 400 }
      );
    }

    let buktiPath = null;

    // Handle upload bukti transfer jika metode = transfer
    if (metodePembayaran === 'transfer' && buktiTransfer) {
      try {
        // Buat folder uploads jika belum ada
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'bukti-transfer');
        await mkdir(uploadsDir, { recursive: true });

        // Generate nama file unik
        const timestamp = Date.now();
        const fileName = `bukti-${reservasiId}-${timestamp}.${buktiTransfer.name.split('.').pop()}`;
        const filePath = join(uploadsDir, fileName);

        // Convert file to buffer dan save
        const bytes = await buktiTransfer.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save path relatif untuk database
        buktiPath = `/uploads/bukti-transfer/${fileName}`;
        console.log('Bukti transfer saved:', buktiPath);
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Gagal upload bukti transfer' },
          { status: 500 }
        );
      }
    }

    // DIPERBAIKI: Ganti ? ke $1
    // Cek apakah sudah ada pembayaran untuk reservasi ini
    const existingPayment: any = await query(
      'SELECT id FROM pembayaran WHERE reservasi_id = $1',
      [reservasiId]
    );

    if (existingPayment.length > 0) {
      // DIPERBAIKI: Ganti ? ke $1, $2, $3, dst + NOW() ke CURRENT_TIMESTAMP
      // Update pembayaran yang sudah ada
      await query(
        `UPDATE pembayaran 
         SET metode_pembayaran = $1,
             nama_pengirim = $2,
             nama_rekening = $3,
             tanggal_transfer = $4,
             bukti_transfer = $5,
             status = 'pending',
             updated_at = CURRENT_TIMESTAMP
         WHERE reservasi_id = $6`,
        [
          metodePembayaran,
          namaPengirim || null,
          namaRekening || null,
          tanggalTransfer || null,
          buktiPath || null,
          reservasiId,
        ]
      );
      console.log('Payment updated for reservasi:', reservasiId);
    } else {
      // DIPERBAIKI: Ganti ? ke $1, $2, $3, dst + NOW() ke CURRENT_TIMESTAMP
      // Insert pembayaran baru
      await query(
        `INSERT INTO pembayaran 
         (reservasi_id, metode_pembayaran, nama_pengirim, nama_rekening, tanggal_transfer, bukti_transfer, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)`,
        [
          reservasiId,
          metodePembayaran,
          namaPengirim || null,
          namaRekening || null,
          tanggalTransfer || null,
          buktiPath || null,
        ]
      );
      console.log('Payment created for reservasi:', reservasiId);
    }

    // DIPERBAIKI: Ganti ? ke $1
    // Update status pembayaran di tabel reservasi
    await query(
      `UPDATE reservasi 
       SET status_pembayaran = 'pending'
       WHERE id = $1`,
      [reservasiId]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Pembayaran berhasil disubmit. Menunggu verifikasi admin.',
        data: {
          reservasi_id: reservasiId,
          metode_pembayaran: metodePembayaran,
          status: 'pending',
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error submitting payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal submit pembayaran',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// API untuk mendapatkan detail pembayaran
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reservasiId = searchParams.get('reservasi_id');

    if (!reservasiId) {
      return NextResponse.json(
        { success: false, error: 'Reservasi ID diperlukan' },
        { status: 400 }
      );
    }

    // DIPERBAIKI: Ganti ? ke $1
    const paymentResult: any = await query(
      `SELECT * FROM pembayaran WHERE reservasi_id = $1`,
      [reservasiId]
    );

    if (paymentResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pembayaran tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: paymentResult[0],
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data pembayaran',
        message: error.message,
      },
      { status: 500 }
    );
  }
}