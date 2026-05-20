import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'LINE Login not yet configured. Please set up LINE channel credentials.' },
    { status: 503 }
  );
}
