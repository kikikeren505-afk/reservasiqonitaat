// Lokasi: app/api/admin/reservasi/[id]/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT - Update status reservasi
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservasiId = params.id;
    const body = await req.json();
    console.log('PUT /api/admin/reservasi/' + reservasiId, body);

    const { status } = body;

    // Validasi
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Update status
    const result: any = await query(
      'UPDATE reservasi SET status = ? WHERE id = ?',
      [status, reservasiId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Reservasi not found' },
        { status: 404 }
      );
    }

    console.log('Reservasi status updated to:', status);

    return NextResponse.json(
      {
        success: true,
        message: 'Status reservasi berhasil diupdate',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating reservasi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update reservasi',
        error: error.message,
      },
      { status: 500 }
    );
  }
}