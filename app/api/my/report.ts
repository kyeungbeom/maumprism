import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function getPeriodRange(period: string) {
  const now = new Date();
  let from: Date;
  if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // week
    const day = now.getDay();
    from = new Date(now);
    from.setDate(now.getDate() - day);
  }
  return from.toISOString();
}

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'week';
  const from = getPeriodRange(period);
  // 상담 내역
  const { count: counselingCount } = await supabase
    .from('counselings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', from);
  // 기록 카드
  const { count: recordCardCount } = await supabase
    .from('record_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', from);
  // 감정 일지(트렌드)
  const { data: emotionLogs } = await supabase
    .from('emotion_logs')
    .select('created_at, emotion')
    .eq('user_id', user.id)
    .gte('created_at', from)
    .order('created_at');
  const emotionTrend = (emotionLogs || []).map((e: any) => ({
    date: e.created_at.slice(0, 10),
    value: e.emotion,
  }));
  // 목표 달성
  const { data: goals } = await supabase
    .from('goals')
    .select('title, progress')
    .eq('user_id', user.id);
  const goalProgress = (goals || []).map((g: any) => ({
    goal: g.title,
    progress: g.progress,
  }));
  return NextResponse.json({
    counselingCount: counselingCount || 0,
    recordCardCount: recordCardCount || 0,
    emotionTrend,
    goalProgress,
  });
}
