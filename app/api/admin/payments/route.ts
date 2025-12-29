// app/api/admin/payments/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic untuk disable caching
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching all payments for admin...');

    // Query untuk mengambil semua pembayaran dengan data lengkap
    const { data: payments, error } = await supabase
      .from('pembayaran')
      .select(`
        *,
        reservasi (
          id,
          user_id,
          durasi_bulan,
          tanggal_mulai,
          tanggal_selesai,
          kost_id,
          kost:kost_id (
            id,
            nama,
            alamat
          ),
          users:user_id (
            id,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${payments?.length || 0} payments`);

    // Format data
    const formattedData = payments?.map((p: any) => ({
      id: p.id,
      reservasi_id: p.reservasi_id,
      jumlah: p.jumlah,
      metode_pembayaran: p.metode_pembayaran,
      status: p.status,
      bukti_pembayaran: p.bukti_pembayaran,
      nama_pengirim: p.nama_pengirim,
      nama_rekening: p.nama_rekening,
      tanggal_transfer: p.tanggal_transfer,
      keterangan: p.keterangan,
      created_at: p.created_at,
      updated_at: p.updated_at,
      // Data dari JOIN - gunakan nama_pengirim sebagai fallback
      user_nama: p.nama_pengirim || p.reservasi?.users?.email || 'N/A',
      user_email: p.reservasi?.users?.email,
      user_hp: null, // Tidak ada di query untuk sementara
      kost_nama: p.reservasi?.kost?.nama || 'N/A',
      kost_alamat: p.reservasi?.kost?.alamat,
      reservasi_durasi: p.reservasi?.durasi_bulan,
      tanggal_mulai: p.reservasi?.tanggal_mulai,
      tanggal_selesai: p.reservasi?.tanggal_selesai
    })) || [];

    console.log('📦 Formatted data sample:', formattedData[0]);

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    });
  } catch (error: any) {
    console.error('❌ Error fetching payments:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data pembayaran',
      error: error.message
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, status, keterangan } = body;

    console.log('🔄 Updating payment:', { payment_id, status, keterangan });

    // Validasi
    if (!payment_id || !status) {
      return NextResponse.json({
        success: false,
        message: 'Payment ID dan status diperlukan'
      }, { status: 400 });
    }

    // Validasi status value
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Status tidak valid. Harus: pending, verified, atau rejected'
      }, { status: 400 });
    }

    // Get payment data terlebih dahulu
    const { data: paymentData, error: fetchError } = await supabase
      .from('pembayaran')
      .select('reservasi_id')
      .eq('id', payment_id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching payment:', fetchError);
      throw new Error('Pembayaran tidak ditemukan');
    }

    console.log('📦 Payment data:', paymentData);

    // Update status pembayaran
    const { error: updateError } = await supabase
      .from('pembayaran')
      .update({ 
        status, 
        keterangan: keterangan || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_id);

    if (updateError) {
      console.error('❌ Error updating payment:', updateError);
      throw updateError;
    }

    console.log('✅ Payment status updated');

    // Jika verified, update juga status reservasi menjadi 'confirmed'
    if (status === 'verified' && paymentData?.reservasi_id) {
      console.log('🔄 Updating reservasi status to confirmed...');
      
      const { error: reservasiUpdateError } = await supabase
        .from('reservasi')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentData.reservasi_id);

      if (reservasiUpdateError) {
        console.error('⚠️ Error updating reservasi (non-blocking):', reservasiUpdateError);
      } else {
        console.log('✅ Reservasi status updated to confirmed');
      }
    }

    // Jika rejected, bisa set reservasi status kembali ke pending
    if (status === 'rejected' && paymentData?.reservasi_id) {
      console.log('🔄 Updating reservasi status to pending...');
      
      const { error: reservasiUpdateError } = await supabase
        .from('reservasi')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentData.reservasi_id);

      if (reservasiUpdateError) {
        console.error('⚠️ Error updating reservasi (non-blocking):', reservasiUpdateError);
      } else {
        console.log('✅ Reservasi status updated to pending');
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'verified' 
        ? 'Pembayaran berhasil diverifikasi' 
        : 'Pembayaran berhasil ditolak'
    });
  } catch (error: any) {
    console.error('❌ Error updating payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengupdate pembayaran',
      error: error.message
    }, { status: 500 });
  }
}