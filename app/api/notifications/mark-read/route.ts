import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    await query(`
      UPDATE notifications
      SET is_read = true
      WHERE is_read = false
    `);

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
