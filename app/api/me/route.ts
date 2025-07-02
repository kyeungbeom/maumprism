import { NextResponse } from 'next/server';

export async function GET() {
  // 임시 mock 데이터
  return NextResponse.json({
    email: 'test@example.com',
    nickname: '테스트유저',
    role: 'admin',
  });
}
