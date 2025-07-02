import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Example JSON logic for 연속 출석 (streak):
// { "type": "streak", "days": 7 }
// Example JSON logic for 특정 시간대 활동:
// { "type": "time", "hour_from": 6, "hour_to": 9 }

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  const { data } = await supabase.from('achievements').select('*');
  // logic 필드 포함 반환
  return NextResponse.json({ achievements: data || [] });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin')
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  const body = await req.json();
  // body.logic 예시: { type: 'streak', days: 7 } 또는 { type: 'time', hour_from: 6, hour_to: 9 }
  const { error } = await supabase.from('achievements').insert([body]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin')
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  const body = await req.json();
  const { error } = await supabase.from('achievements').update(body).eq('code', body.code);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin')
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  const { code } = await req.json();
  const { error } = await supabase.from('achievements').delete().eq('code', code);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
