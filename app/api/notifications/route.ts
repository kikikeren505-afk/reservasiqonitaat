// Lokasi: app/api/notifications/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('GET /api/notifications');

    // Query reservasi baru yang belum dikonfirmasi
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservasi')
      .select(`
        id,
        user_id,
        kost_id,
        tanggal_mulai,
        status,
        created_at,
        users:user_id (
          nama_lengkap
        ),
        kost:kost_id (
          nama
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    if (reservationsError) {
      console.error('❌ Error fetching reservations:', reservationsError);
    }

    // Query pembayaran baru yang belum dikonfirmasi
    const { data: payments, error: paymentsError } = await supabase
      .from('pembayaran')
      .select(`
        id,
        reservasi_id,
        status,
        created_at,
        reservasi:reservasi_id (
          total_harga,
          user_id,
          users:user_id (
            nama_lengkap
          ),
          kost:kost_id (
            nama
          )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError);
    }

    console.log('✅ Reservations found:', reservations?.length || 0);
    console.log('✅ Payments found:', payments?.length || 0);

    // Format notifikasi
    const notifications = [
      // Notifikasi reservasi
      ...(reservations || []).map((r: any) => ({
        id: `res-${r.id}`,
        type: 'reservation' as const,
        title: 'Reservasi Baru',
        message: `${r.users?.nama_lengkap || 'User'} booking ${r.kost?.nama || 'kost'} untuk tanggal ${new Date(r.tanggal_mulai).toLocaleDateString('id-ID')}`,
        customerName: r.users?.nama_lengkap || 'Unknown',
        timestamp: r.created_at,
        link: `/admin/reservasi`,
      })),
      // Notifikasi pembayaran
      ...(payments || []).map((p: any) => ({
        id: `pay-${p.id}`,
        type: 'payment' as const,
        title: 'Pembayaran Baru',
        message: `${p.reservasi?.users?.nama_lengkap || 'User'} mengirim bukti transfer untuk ${p.reservasi?.kost?.nama || 'kost'}`,
        customerName: p.reservasi?.users?.nama_lengkap || 'Unknown',
        amount: p.reservasi?.total_harga,
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