import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  // 업적 히스토리
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('achieved_at, achievement:achievements(name, description, icon, badge_type)')
    .eq('user_id', user.id)
    .order('achieved_at');
  // 성장/활동 로그(예: history_log)
  const { data: logs } = await supabase
    .from('history_log')
    .select('created_at, action, detail, icon')
    .eq('user_id', user.id)
    .order('created_at');
  // 타임라인 합치기
  const history = [
    ...(achievements || []).map((a) => {
      const achievement =
        a.achievement && !Array.isArray(a.achievement) ? (a.achievement as any) : null;
      return {
        type: 'achievement',
        title: achievement?.name,
        description: achievement?.description,
        icon: achievement?.icon,
        date: a.achieved_at,
      };
    }),
    ...(logs || []).map((l) => ({
      type: 'log',
      title: l.action,
      description: l.detail,
      icon: l.icon || '📝',
      date: l.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json({ history });
}
