import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  // 통계 집계
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  const { count: reportCount } = await supabase
    .from('growth_report')
    .select('*', { count: 'exact', head: true });
  const { count: counselingCount } = await supabase
    .from('counselings')
    .select('*', { count: 'exact', head: true });
  const { count: emotionCount } = await supabase
    .from('emotion_cards')
    .select('*', { count: 'exact', head: true });
  const result = {
    userCount: userCount || 0,
    reportCount: reportCount || 0,
    counselingCount: counselingCount || 0,
    emotionCount: emotionCount || 0,
    createdAt: new Date().toISOString(),
  };
  // 로그/리포트 저장
  await supabase.from('logs').insert([
    {
      type: 'info',
      message: '[CRON] 주간 운영 리포트',
      meta: result,
      created_at: new Date(),
    },
  ]);
  // TODO: 이메일/슬랙 연동 확장 가능
  return NextResponse.json(result);
}
