import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET user transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Query transaksi/reservasi dengan JOIN ke kost
    const { data: transaksi, error } = await supabase
      .from('reservasi')
      .select(`
        *,
        kost:kost_id (
          nama,
          alamat,
          harga,
          fasilitas
        )
      `)
      .eq('user_id', userId)
      .order('tanggal_mulai', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    // Transform data untuk match format lama
    const transformedData = transaksi?.map((item: any) => ({
      ...item,
      Nama_kost: item.kost?.nama,
      Alamat_kost: item.kost?.alamat,
      Harga: item.kost?.harga,
      Fasilitas: item.kost?.fasilitas,
    })) || [];

    return NextResponse.json(
      {
        message: 'Data transaksi berhasil diambil',
        data: transformedData
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Get transaksi error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new transaction/reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, kost_id, tanggal_mulai, durasi_bulan, total_harga, status } = body;

    // Validation
    if (!user_id || !kost_id || !tanggal_mulai) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if kost exists
    const { data: kost, error: kostError } = await supabase
      .from('kost')
      .select('*')
      .eq('id', kost_id)
      .single();

    if (kostError || !kost) {
      return NextResponse.json(
        { message: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check existing active reservations
    const { data: existingReservation } = await supabase
      .from('reservasi')
      .select('*')
      .eq('kost_id', kost_id)
      .in('status', ['pending', 'confirmed'])
      .single();

    if (existingReservation) {
      return NextResponse.json(
        { message: 'Kost sudah dipesan' },
        { status: 409 }
      );
    }

    // Create transaction/reservasi
    const { data: newReservasi, error } = await supabase
      .from('reservasi')
      .insert({
        user_id,
        kost_id,
        tanggal_mulai,
        durasi_bulan: durasi_bulan || 1,
        total_harga: total_harga || kost.harga,
        status: status || 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        message: 'Reservasi berhasil dibuat',
        transaksi_id: newReservasi.id
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Create transaksi error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}

// PUT update transaction status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaksi_id, status } = body;

    if (!transaksi_id || !status) {
      return NextResponse.json(
        { message: 'ID transaksi dan status diperlukan' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('reservasi')
      .update({ status })
      .eq('id', transaksi_id);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(
      { message: 'Status transaksi berhasil diupdate' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Update transaksi error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}