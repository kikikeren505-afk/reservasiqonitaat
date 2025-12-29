import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ✅ Tambahkan ini untuk fix dynamic server error
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const reservasiId = formData.get('reservasi_id') as string;
    const metodePembayaran = formData.get('metode_pembayaran') as string;
    const namaPengirim = formData.get('nama_pengirim') as string;
    const namaRekening = formData.get('nama_rekening') as string;
    const tanggalTransfer = formData.get('tanggal_transfer') as string;
    const buktiTransfer = formData.get('bukti_transfer') as File | null;

    console.log('POST /api/payments/submit - reservasi_id:', reservasiId);
    console.log('Metode pembayaran:', metodePembayaran);

    // Validasi
    if (!reservasiId || !metodePembayaran) {
      return NextResponse.json(
        { success: false, error: 'Reservasi ID dan metode pembayaran harus diisi' },
        { status: 400 }
      );
    }

    let buktiPath = null;

    // Handle upload bukti transfer jika metode = transfer
    if (metodePembayaran === 'transfer' && buktiTransfer) {
      try {
        // Buat folder uploads jika belum ada
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'bukti-transfer');
        await mkdir(uploadsDir, { recursive: true });

        // Generate nama file unik
        const timestamp = Date.now();
        const fileName = `bukti-${reservasiId}-${timestamp}.${buktiTransfer.name.split('.').pop()}`;
        const filePath = join(uploadsDir, fileName);

        // Convert file to buffer dan save
        const bytes = await buktiTransfer.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save path relatif untuk database
        buktiPath = `/uploads/bukti-transfer/${fileName}`;
        console.log('✅ Bukti transfer saved:', buktiPath);
      } catch (uploadError) {
        console.error('❌ Error uploading file:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Gagal upload bukti transfer' },
          { status: 500 }
        );
      }
    }

    // ✅ Cek apakah sudah ada pembayaran untuk reservasi ini
    const { data: existingPayment, error: checkError } = await supabase
      .from('pembayaran')
      .select('id')
      .eq('reservasi_id', reservasiId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing payment:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database error: ' + checkError.message },
        { status: 500 }
      );
    }

    if (existingPayment) {
      // ✅ Update pembayaran yang sudah ada
      const { error: updateError } = await supabase
        .from('pembayaran')
        .update({
          metode_pembayaran: metodePembayaran,
          nama_pengirim: namaPengirim || null,
          nama_rekening: namaRekening || null,
          tanggal_transfer: tanggalTransfer || null,
          bukti_transfer: buktiPath || null,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('reservasi_id', reservasiId);

      if (updateError) {
        console.error('❌ Error updating payment:', updateError);
        return NextResponse.json(
          { success: false, error: 'Gagal update pembayaran: ' + updateError.message },
          { status: 500 }
        );
      }

      console.log('✅ Payment updated for reservasi:', reservasiId);
    } else {
      // ✅ Insert pembayaran baru
      const { error: insertError } = await supabase
        .from('pembayaran')
        .insert({
          reservasi_id: reservasiId,
          metode_pembayaran: metodePembayaran,
          nama_pengirim: namaPengirim || null,
          nama_rekening: namaRekening || null,
          tanggal_transfer: tanggalTransfer || null,
          bukti_transfer: buktiPath || null,
          status: 'pending'
        });

      if (insertError) {
        console.error('❌ Error inserting payment:', insertError);
        return NextResponse.json(
          { success: false, error: 'Gagal insert pembayaran: ' + insertError.message },
          { status: 500 }
        );
      }

      console.log('✅ Payment created for reservasi:', reservasiId);
    }

    // ✅ Update status pembayaran di tabel reservasi
    const { error: updateReservasiError } = await supabase
      .from('reservasi')
      .update({ status_pembayaran: 'pending' })
      .eq('id', reservasiId);

    if (updateReservasiError) {
      console.error('❌ Error updating reservasi status:', updateReservasiError);
      // Tidak return error karena pembayaran sudah tersimpan
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pembayaran berhasil disubmit. Menunggu verifikasi admin.',
        data: {
          reservasi_id: reservasiId,
          metode_pembayaran: metodePembayaran,
          status: 'pending',
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error submitting payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal submit pembayaran',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ✅ API untuk mendapatkan detail pembayaran
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reservasiId = searchParams.get('reservasi_id');

    if (!reservasiId) {
      return NextResponse.json(
        { success: false, error: 'Reservasi ID diperlukan' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching payment for reservasi:', reservasiId);

    // ✅ Query dengan Supabase
    const { data: payment, error } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('reservasi_id', reservasiId)
      .maybeSingle();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Pembayaran tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('✅ Payment found');

    return NextResponse.json(
      {
        success: true,
        data: payment,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data pembayaran',
        message: error.message,
      },
      { status: 500 }
    );
  }
}