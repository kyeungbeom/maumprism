import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

async function sendNotification(supabase: any, userId: string, title: string, message: string) {
  await supabase
    .from('notifications')
    .insert([{ user_id: userId, title, message, type: 'achievement' }]);
}

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  // 활동 집계
  const { count: counselingCount } = await supabase
    .from('counselings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  const { count: cardCount } = await supabase
    .from('record_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  const { count: emotionCount } = await supabase
    .from('emotion_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  // 업적 조건
  const conditions = [
    { code: 'first_counseling', cond: (counselingCount || 0) >= 1 },
    { code: 'card_10', cond: (cardCount || 0) >= 10 },
    { code: 'emotion_3', cond: (emotionCount || 0) >= 3 },
    { code: 'master', cond: (cardCount || 0) >= 30 },
    { code: 'explorer', cond: (emotionCount || 0) >= 10 },
  ];
  // 이미 달성한 업적
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement:achievements(code)')
    .eq('user_id', user.id);
  const achievedCodes = new Set((userAchievements || []).map((ua: any) => ua.achievement?.code));
  // 신규 달성 업적
  const { data: allAchievements } = await supabase.from('achievements').select('*');
  const newAchievements: any[] = [];
  for (const cond of conditions) {
    if (cond.cond && !achievedCodes.has(cond.code)) {
      if (allAchievements) {
        const ach = allAchievements.find((a: any) => a.code === cond.code);
        if (ach) {
          await supabase
            .from('user_achievements')
            .insert([{ user_id: user.id, achievement_id: ach.id }]);
          await sendNotification(
            supabase,
            user.id,
            '업적 달성!',
            `${ach.name} 업적을 획득했습니다.`,
          );
          newAchievements.push(ach);
        }
      }
    }
  }
  return NextResponse.json({ newAchievements });
}
