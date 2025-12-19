import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Untuk sementara return data dummy
    return NextResponse.json({
      success: true,
      data: []
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}