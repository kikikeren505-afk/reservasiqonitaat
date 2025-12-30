import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest, context: any) {
  const id = context.params.id;
  
  console.log('🔥 PATCH request untuk ID:', id);
  
  try {
    const body = await request.json();
    console.log('📦 Body request:', body);
    
    const { action, status } = body;

    let newStatus;
    
    // Support dua cara: action atau status langsung
    if (action) {
      if (action === 'konfirmasi') {
        newStatus = 'confirmed';
      } else if (action === 'tolak') {
        newStatus = 'rejected';
      } else {
        return NextResponse.json(
          { success: false, message: 'Action tidak valid. Gunakan "konfirmasi" atau "tolak"' },
          { status: 400 }
        );
      }
    } else if (status) {
      newStatus = status;
    } else {
      return NextResponse.json(
        { success: false, message: 'Field action atau status harus ada' },
        { status: 400 }
      );
    }
    
    console.log('📝 Update status ke:', newStatus);

    const { data, error } = await supabaseAdmin
      .from('reservasi')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Berhasil update reservasi!');

    return NextResponse.json({
      success: true,
      message: `Reservasi berhasil diupdate ke status ${newStatus}`,
      data: data
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}