import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const reservasiId = formData.get('reservasi_id') as string;

    console.log('POST /api/payments/upload - reservasi_id:', reservasiId);

    if (!file || !reservasiId) {
      return NextResponse.json(
        { success: false, error: 'File dan reservasi ID harus diisi' },
        { status: 400 }
      );
    }

    try {
      // Buat folder uploads jika belum ada
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'bukti-transfer');
      await mkdir(uploadsDir, { recursive: true });

      // Generate nama file unik
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `bukti-${reservasiId}-${timestamp}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);

      // Convert file to buffer dan save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Path relatif untuk database
      const buktiPath = `/uploads/bukti-transfer/${fileName}`;
      console.log('✅ File uploaded:', buktiPath);

      // ✅ Update bukti transfer di tabel pembayaran dengan Supabase
      const { error: updateError } = await supabase
        .from('pembayaran')
        .update({ 
          bukti_transfer: buktiPath,
          updated_at: new Date().toISOString()
        })
        .eq('reservasi_id', reservasiId);

      if (updateError) {
        console.error('❌ Error updating bukti transfer:', updateError);
        return NextResponse.json(
          { success: false, error: 'Gagal update bukti transfer: ' + updateError.message },
          { status: 500 }
        );
      }

      console.log('✅ Bukti transfer updated in database');

      return NextResponse.json(
        {
          success: true,
          message: 'Bukti transfer berhasil diupload',
          data: {
            file_path: buktiPath,
            file_name: fileName
          }
        },
        { status: 200 }
      );

    } catch (uploadError: any) {
      console.error('❌ Error uploading file:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Gagal upload file: ' + uploadError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error in upload handler:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memproses upload',
        message: error.message
      },
      { status: 500 }
    );
  }
}