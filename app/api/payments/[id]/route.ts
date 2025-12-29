import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Get payment by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = parseInt(params.id);
    
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    console.log(`✅ Fetching payment #${paymentId}...`);

    // Ambil detail pembayaran
    const { data: payment, error: paymentError } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      console.error('❌ Supabase error:', paymentError);
      throw paymentError;
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Ambil data reservasi
    const { data: reservasi } = await supabase
      .from('reservasi')
      .select('*')
      .eq('id', payment.reservasi_id)
      .single();

    // Ambil data kost
    let kost = null;
    if (reservasi) {
      const { data: kostData } = await supabase
        .from('kost')
        .select('*')
        .eq('id', reservasi.kost_id)
        .single();
      kost = kostData;
    }

    const formattedPayment = {
      id: payment.id,
      reservasiId: payment.reservasi_id,
      namaKost: kost?.nama || 'N/A',
      namaPenyewa: reservasi?.nama_penyewa || payment.nama_pengirim || 'N/A',
      jumlah: 0,
      metodePembayaran: payment.metode_pembayaran || 'N/A',
      status: payment.status || 'pending',
      tanggalPembayaran: payment.created_at,
      buktiPembayaran: payment.bukti_transfer,
      namaPengirim: payment.nama_pengirim,
      namaRekening: payment.nama_rekening,
      tanggalTransfer: payment.tanggal_transfer,
      catatanAdmin: payment.catatan_admin
    };

    console.log(`✅ Payment #${paymentId} fetched successfully`);

    return NextResponse.json({
      success: true,
      data: formattedPayment
    });
  } catch (error: any) {
    console.error('❌ Error fetching payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update payment status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = parseInt(params.id);
    
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, catatanAdmin } = body;

    console.log(`✅ Updating payment #${paymentId} to status: ${status}`);

    // Validasi status
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update data pembayaran
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Jika verified, set verified_at
    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString();
    }

    // Jika ada catatan admin
    if (catatanAdmin) {
      updateData.catatan_admin = catatanAdmin;
    }

    const { data: updatedPayment, error: updateError } = await supabase
      .from('pembayaran')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Supabase update error:', updateError);
      throw updateError;
    }

    console.log(`✅ Payment #${paymentId} updated successfully`);

    // Jika status verified, update reservasi jadi confirmed
    if (status === 'verified' && updatedPayment.reservasi_id) {
      console.log(`🔄 Updating reservasi #${updatedPayment.reservasi_id} to confirmed...`);
      
      const { error: reservasiError } = await supabase
        .from('reservasi')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPayment.reservasi_id);

      if (reservasiError) {
        console.error('⚠️ Warning: Failed to update reservasi status:', reservasiError);
        // Tidak throw error, payment tetap berhasil diupdate
      } else {
        console.log(`✅ Reservasi #${updatedPayment.reservasi_id} confirmed`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: updatedPayment
    });
  } catch (error: any) {
    console.error('❌ Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = parseInt(params.id);
    
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    console.log(`✅ Deleting payment #${paymentId}...`);

    const { error: deleteError } = await supabase
      .from('pembayaran')
      .delete()
      .eq('id', paymentId);

    if (deleteError) {
      console.error('❌ Supabase delete error:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Payment #${paymentId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}