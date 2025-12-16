import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('proof') as File;
    const paymentId = formData.get('paymentId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `payment-${paymentId}-${Date.now()}.${file.name.split('.').pop()}`;
    const filepath = join(process.cwd(), 'public', 'uploads', 'payments', filename);

    // Save file
    await writeFile(filepath, buffer);

    // Update database
    await db.query(
      `UPDATE payments 
       SET proof_image = ?, payment_date = NOW() 
       WHERE id = ?`,
      [`/uploads/payments/${filename}`, paymentId]
    );

    return NextResponse.json({
      success: true,
      filename: filename,
      path: `/uploads/payments/${filename}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}