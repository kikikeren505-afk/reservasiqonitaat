import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const body = await req.json();
    const { status } = body;

    console.log('🔄 PATCH Payment - ID:', paymentId, '| New Status:', status);

    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Cek apakah payment exists
    const { data: checkPayment, error: checkError } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('id', paymentId) // ✅ FIXED: id bukan pengenal
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking payment:', checkError);
      return NextResponse.json(
        { success: false, message: 'Error checking payment' },
        { status: 500 }
      );
    }

    if (!checkPayment) {
      console.error('❌ Payment tidak ditemukan dengan ID:', paymentId);
      return NextResponse.json(
        { success: false, message: `Payment dengan ID ${paymentId} tidak ditemukan` },
        { status: 404 }
      );
    }

    console.log('✅ Payment exists, old status:', checkPayment.status);

    // Update payment
    const { data: updatedPayment, error: updateError } = await supabase
      .from('pembayaran')
      .update({ status })
      .eq('id', paymentId) // ✅ FIXED: id bukan pengenal
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating payment:', updateError);
      return NextResponse.json(
        { success: false, message: 'Gagal update payment' },
        { status: 500 }
      );
    }

    console.log('✅ Payment updated! New status:', updatedPayment.status);

    revalidatePath('/admin/payments');

    return NextResponse.json({
      success: true,
      message: 'Payment status berhasil diupdate',
      data: updatedPayment
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}