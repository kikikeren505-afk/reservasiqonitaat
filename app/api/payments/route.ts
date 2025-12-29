// app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reservasi_id,
      jumlah,
      metode_pembayaran,
      status,
      bukti_pembayaran, // ini base64 string
      nama_pengirim,
      nama_rekening,
      tanggal_transfer,
      keterangan
    } = body;

    // Validasi
    if (!reservasi_id || !jumlah || !metode_pembayaran) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak lengkap'
      }, { status: 400 });
    }

    // Insert pembayaran (bukti_pembayaran disimpan sebagai base64 atau URL)
    const { data, error } = await supabase
      .from('pembayaran')
      .insert({
        reservasi_id,
        jumlah,
        metode_pembayaran,
        status: status || 'pending',
        bukti_pembayaran, // simpan base64 atau URL
        nama_pengirim,
        nama_rekening,
        tanggal_transfer,
        keterangan
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Pembayaran berhasil disimpan',
      data: data
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menyimpan pembayaran',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reservasi_id = searchParams.get('reservasi_id');

    if (!reservasi_id) {
      return NextResponse.json({
        success: false,
        message: 'Reservasi ID diperlukan'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('reservasi_id', reservasi_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data pembayaran',
      error: error.message
    }, { status: 500 });
  }
}