// ========================================
// FILE: app/api/admin/reservasi/[id]/route.ts (FIXED dengan Admin Client)
// ========================================
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase'; // ← GANTI KE ADMIN CLIENT!
import { revalidatePath } from 'next/cache';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservasiId = params.id;
    const body = await req.json();
    const { status } = body;

    console.log('🔄 ========================================');
    console.log('🔄 UPDATE RESERVASI REQUEST (ADMIN CLIENT)');
    console.log('🔄 Reservasi ID:', reservasiId);
    console.log('🔄 New Status:', status);
    console.log('🔄 ========================================');

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      console.error('❌ Invalid status:', status);
      return NextResponse.json(
        { success: false, message: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Step 1: Cek apakah reservasi exists (dengan admin client)
    console.log('🔍 Step 1: Checking if reservasi exists (ADMIN CLIENT)...');
    const { data: checkReservasi, error: checkError } = await supabaseAdmin
      .from('reservasi')
      .select('*')
      .eq('id', reservasiId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking reservasi:', checkError);
      return NextResponse.json(
        { success: false, message: 'Error checking reservasi', error: checkError.message },
        { status: 500 }
      );
    }

    if (!checkReservasi) {
      console.error('❌ Reservasi tidak ditemukan dengan ID:', reservasiId);
      
      const { data: allReservasi } = await supabaseAdmin
        .from('reservasi')
        .select('id, status');
      console.log('📋 Available reservasi:', allReservasi);
      
      return NextResponse.json(
        { success: false, message: `Reservasi dengan ID ${reservasiId} tidak ditemukan` },
        { status: 404 }
      );
    }

    console.log('✅ Reservasi found!');
    console.log('   - ID:', checkReservasi.id);
    console.log('   - Current status:', checkReservasi.status);

    // Step 2: Update reservasi (dengan admin client - BYPASS RLS)
    console.log('🔄 Step 2: Updating reservasi status (ADMIN CLIENT - BYPASS RLS)...');
    const { data: updatedReservasi, error: updateError } = await supabaseAdmin
      .from('reservasi')
      .update({ status: status })
      .eq('id', reservasiId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating reservasi:', updateError);
      console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { success: false, message: 'Gagal update reservasi', error: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedReservasi) {
      console.error('❌ Updated reservasi is null');
      return NextResponse.json(
        { success: false, message: 'Reservasi update returned null' },
        { status: 500 }
      );
    }

    console.log('✅ ========================================');
    console.log('✅ RESERVASI UPDATED SUCCESSFULLY (ADMIN CLIENT)!');
    console.log('✅ Reservasi ID:', updatedReservasi.id);
    console.log('✅ Old status:', checkReservasi.status);
    console.log('✅ New status:', updatedReservasi.status);
    console.log('✅ RLS BYPASSED!');
    console.log('✅ ========================================');

    // Revalidate cache
    revalidatePath('/admin/reservasi');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      message: 'Status reservasi berhasil diupdate',
      data: updatedReservasi
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ ========================================');
    console.error('❌ CATCH ERROR');
    console.error('❌ Error:', error);
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ========================================');
    return NextResponse.json(
      { success: false, message: 'Failed to update reservasi', error: error.message },
      { status: 500 }
    );
  }
}