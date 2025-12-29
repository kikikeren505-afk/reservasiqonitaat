import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('📬 Marking all notifications as read...');

    // ✅ Update dengan Supabase
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to mark notifications as read: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Marked ${data?.length || 0} notifications as read`);

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('❌ Error marking notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read', message: error.message },
      { status: 500 }
    );
  }
}