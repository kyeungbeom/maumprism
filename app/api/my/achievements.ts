import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  // 내 업적/칭호 목록
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('*, achievement:achievements(*)')
    .eq('user_id', user.id)
    .order('achieved_at');
  // 전체 업적 목록
  const { data: allAchievements } = await supabase.from('achievements').select('*');
  return NextResponse.json({
    userAchievements: userAchievements || [],
    allAchievements: allAchievements || [],
  });
}
