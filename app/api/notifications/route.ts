// Lokasi: app/api/notifications/route.ts
// ✅ FIX: Sesuaikan dengan struktur database yang benar

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('GET /api/notifications');

    // Query reservasi baru yang belum dikonfirmasi
    const reservations: any = await query(
      `SELECT 
        r.id, 
        r.user_id, 
        r.kost_id, 
        r.tanggal_mulai, 
        r.status, 
        r.created_at,
        u.nama_lengkap as customer_name,
        k.nama as kost_name
       FROM reservasi r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN kost k ON r.kost_id = k.id
       WHERE r.status = 'pending' 
       ORDER BY r.created_at DESC 
       LIMIT 10`
    );

    // Query pembayaran baru yang belum dikonfirmasi
    const payments: any = await query(
      `SELECT 
        p.id, 
        p.reservasi_id, 
        p.status, 
        p.created_at,
        r.total_harga as amount,
        r.user_id,
        u.nama_lengkap as customer_name,
        k.nama as kost_name
       FROM pembayaran p
       LEFT JOIN reservasi r ON p.reservasi_id = r.id
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN kost k ON r.kost_id = k.id
       WHERE p.status = 'pending' 
       ORDER BY p.created_at DESC 
       LIMIT 10`
    );

    console.log('Reservations found:', reservations?.length || 0);
    console.log('Payments found:', payments?.length || 0);

    // Format notifikasi
    const notifications = [
      // Notifikasi reservasi
      ...(reservations || []).map((r: any) => ({
        id: `res-${r.id}`,
        type: 'reservation' as const,
        title: 'Reservasi Baru',
        message: `${r.customer_name || 'User'} booking ${r.kost_name || 'kost'} untuk tanggal ${new Date(r.tanggal_mulai).toLocaleDateString('id-ID')}`,
        customerName: r.customer_name || 'Unknown',
        timestamp: r.created_at,
        link: `/admin/reservasi`,
      })),
      // Notifikasi pembayaran
      ...(payments || []).map((p: any) => ({
        id: `pay-${p.id}`,
        type: 'payment' as const,
        title: 'Pembayaran Baru',
        message: `${p.customer_name || 'User'} mengirim bukti transfer untuk ${p.kost_name || 'kost'}`,
        customerName: p.customer_name || 'Unknown',
        amount: p.amount,
        timestamp: p.created_at,
        link: `/admin/payments`,
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Ambil 10 notifikasi terbaru

    console.log('✅ Total notifications:', notifications.length);

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch notifications',
        message: error.message 
      },
      { status: 500 }
    );
  }
}