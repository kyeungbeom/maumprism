import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  // DAU/WAU
  const today = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().slice(0, 10);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  // DAU: 오늘 활동한 유저 수
  const { data: dauRaw } = await supabase
    .from('history_log')
    .select('user_id')
    .gte('created_at', todayStr);
  const dauUsers = Array.from(new Set((dauRaw || []).map((u) => u.user_id)));
  // WAU: 최근 7일 활동 유저 수
  const { data: wauRaw } = await supabase
    .from('history_log')
    .select('user_id')
    .gte('created_at', weekAgoStr);
  const wauUsers = Array.from(new Set((wauRaw || []).map((u) => u.user_id)));
  // 리포트 생성 수
  const { count: reportCount } = await supabase
    .from('growth_report')
    .select('*', { count: 'exact', head: true });
  // 챗봇 사용 평균횟수
  const { data: chatLogs } = await supabase
    .from('history_log')
    .select('user_id')
    .eq('action', 'CHATBOT');
  const chatbotAvg = chatLogs ? chatLogs.length / (wauUsers?.length || 1) : 0;
  // 감정카드 작성률
  const { count: emotionCount } = await supabase
    .from('emotion_cards')
    .select('*', { count: 'exact', head: true });
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  const emotionRate = userCount ? (emotionCount || 0) / userCount : 0;
  return NextResponse.json({
    DAU: dauUsers?.length || 0,
    WAU: wauUsers?.length || 0,
    reportCount: reportCount || 0,
    chatbotAvg: Math.round(chatbotAvg * 100) / 100,
    emotionRate: Math.round(emotionRate * 100) / 100,
  });
}
