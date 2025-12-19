// app/api/notifications/mark-read/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const connection = await pool.getConnection();
    
    // Update status notifikasi di database
    // Opsional: Anda bisa tambah kolom 'notification_read' di tabel reservasi dan payments
    
    // Contoh jika ada kolom notification_read:
    // await connection.query(
    //   `UPDATE reservasi SET notification_read = true WHERE status = 'pending'`
    // );
    // await connection.query(
    //   `UPDATE payments SET notification_read = true WHERE status = 'pending'`
    // );
    
    connection.release();

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' }, 
      { status: 500 }
    );
  }
}