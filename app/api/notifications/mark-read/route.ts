import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST() {
  try {
    const updated = await execute(`
      UPDATE notifications
      SET is_read = true
      WHERE is_read = false
    `);

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
