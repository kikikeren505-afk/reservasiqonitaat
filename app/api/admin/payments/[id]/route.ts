// Lokasi: app/api/admin/payments/[id]/route.ts
// ✅ FIX: Ganti u.name menjadi u.nama_lengkap

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

// GET - Ambil detail pembayaran spesifik
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    console.log('GET /api/admin/payments/' + paymentId);

    const payments: any = await query(
      `SELECT 
        p.*,
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
      WHERE p.id = ?`,
      [paymentId]
    );

    if (!payments || payments.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const p = payments[0];
    const formattedPayment = {
      id: p.id.toString(),
      userId: p.user_id?.toString() || 'N/A',
      userName: p.user_name || 'Unknown',
      userEmail: p.user_email || '',
      kostName: p.kost_name || 'Unknown',
      amount: p.total_harga || 0,
      paymentMethod: p.metode_pembayaran === 'transfer' ? `Transfer Bank - ${p.nama_rekening || ''}` : 'Cash',
      status: p.status,
      buktiTransfer: p.bukti_transfer || null,
      bookingDate: p.tanggal_mulai || p.created_at,
      createdAt: p.created_at,
      duration: p.durasi_bulan || 0,
    };

    return NextResponse.json(formattedPayment, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update status pembayaran
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, catatan_admin } = await request.json();
    const paymentId = params.id;

    console.log('PATCH /api/admin/payments/' + paymentId, { status, catatan_admin });

    // Validasi status
    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "verified" or "rejected"' },
        { status: 400 }
      );
    }

    // Update pembayaran di database
    const result: any = await query(
      `UPDATE pembayaran 
       SET status = ?,
           catatan_admin = ?,
           verified_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [status, catatan_admin || null, paymentId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Jika status verified, update status reservasi juga
    if (status === 'verified') {
      await query(
        `UPDATE reservasi r
         INNER JOIN pembayaran p ON r.id = p.reservasi_id
         SET r.status = 'confirmed'
         WHERE p.id = ?`,
        [paymentId]
      );
      console.log('✅ Reservasi status updated to confirmed');
    }

    // Clear cache
    revalidatePath('/admin/payments');
    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/reservasi');
    console.log('✅ Cache cleared for payment pages');

    return NextResponse.json({
      success: true,
      message: `Pembayaran berhasil ${status === 'verified' ? 'dikonfirmasi' : 'ditolak'}`,
      paymentId,
      status
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update payment',
        message: error.message 
      },
      { status: 500 }
    );
  }
}