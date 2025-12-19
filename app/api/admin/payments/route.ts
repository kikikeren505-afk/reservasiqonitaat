// Lokasi: app/api/admin/payments/route.ts
// ✅ FIX: Ganti u.name menjadi u.nama_lengkap

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Ambil semua pembayaran dari database
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/payments');

    // Query pembayaran dengan JOIN ke tabel reservasi, users, dan kost
    const payments: any = await query(
      `SELECT 
        p.id,
        p.reservasi_id,
        p.metode_pembayaran,
        p.nama_pengirim,
        p.nama_rekening,
        p.tanggal_transfer,
        p.bukti_transfer,
        p.status,
        p.catatan_admin,
        p.verified_by,
        p.verified_at,
        p.created_at,
        p.updated_at,
        r.user_id,
        r.kost_id,
        r.durasi_bulan,
        r.total_harga,
        r.tanggal_mulai,
        u.nama_lengkap as user_name,
        u.email as user_email,
        k.nama as kost_name
      FROM pembayaran p
      LEFT JOIN reservasi r ON p.reservasi_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN kost k ON r.kost_id = k.id
      ORDER BY p.created_at DESC`
    );

    console.log('Payments found:', payments?.length || 0);

    // Handle empty array
    if (!payments || payments.length === 0) {
      console.log('No payments found, returning empty array');
      return NextResponse.json([], { status: 200 });
    }

    // Format data untuk frontend
    const formattedPayments = payments.map((p: any) => ({
      id: p.id?.toString() || '0',
      userId: p.user_id?.toString() || 'N/A',
      userName: p.user_name || 'Unknown',
      userEmail: p.user_email || '',
      kostName: p.kost_name || 'Unknown',
      amount: p.total_harga || 0,
      paymentMethod: p.metode_pembayaran === 'transfer' ? `Transfer Bank - ${p.nama_rekening || ''}` : 'Cash',
      status: p.status || 'pending',
      buktiTransfer: p.bukti_transfer || null,
      namaPengirim: p.nama_pengirim || '',
      namaRekening: p.nama_rekening || '',
      tanggalTransfer: p.tanggal_transfer || null,
      bookingDate: p.tanggal_mulai || p.created_at,
      createdAt: p.created_at,
      duration: p.durasi_bulan || 0,
      catatanAdmin: p.catatan_admin || null,
      verifiedBy: p.verified_by || null,
      verifiedAt: p.verified_at || null,
      reservasiId: p.reservasi_id
    }));

    console.log('✅ Formatted payments:', formattedPayments.length);
    return NextResponse.json(formattedPayments, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error fetching payments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch payments',
        message: error.message 
      },
      { status: 500 }
    );
  }
}