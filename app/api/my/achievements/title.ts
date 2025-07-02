import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  const { achievementId } = await req.json();
  // 모든 칭호 is_title false로 초기화
  await supabase.from('user_achievements').update({ is_title: false }).eq('user_id', user.id);
  // 선택한 칭호만 true
  await supabase
    .from('user_achievements')
    .update({ is_title: true })
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId);
  return NextResponse.json({ success: true });
}
