import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: 'ok',
      message: 'API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
      supabase: 'healthy',
    });
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}