import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('✅ Fetching kost data from Supabase...');
    
    const { data: kost, error } = await supabase
      .from('kost')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Kost found: ${kost?.length || 0}`);

    return NextResponse.json({
      success: true,
      data: kost || []
    });
  } catch (error: any) {
    console.error('❌ Error fetching kost:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Creating kost:', body);

    const { data: newKost, error } = await supabase
      .from('kost')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Kost created:', newKost);

    return NextResponse.json({
      success: true,
      data: newKost
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating kost:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}