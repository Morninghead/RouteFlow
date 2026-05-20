import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Firebase auth is no longer used. Use /api/auth/session instead.' },
    { status: 410 }
  );
}
