import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // In real use, log to DB or external system
  const body = await req.json();
  // Optionally: console.log('ADMIN LOG', body);
  return NextResponse.json({ success: true });
}
