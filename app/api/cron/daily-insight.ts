import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function getMonthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthAgoStr = monthAgo.toISOString().slice(0, 10);

  // 전체 사용자
  const { data: users = [] } = await supabase.from('users').select('id, created_at');
  // MAU
  const { data: mauRaw } = await supabase
    .from('history_log')
    .select('user_id')
    .gte('created_at', monthAgoStr);
  const mauUsers = Array.from(new Set((mauRaw || []).map((u) => u.user_id)));
  // 비활성 사용자
  const activeUserIds = new Set(mauUsers);
  const inactiveUsers = users.filter((u) => !activeUserIds.has(u.id));
  // 신규 가입자(어제~오늘)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const { data: newUsers = [] } = await supabase
    .from('users')
    .select('id')
    .gte('created_at', yesterday.toISOString().slice(0, 10));
  // 프롬프트 클릭률
  const { data: promptLogs = [] } = await supabase.from('history_log').select('action');
  const recommendCount = promptLogs.filter((l) => l.action === 'PROMPT_RECOMMEND').length;
  const clickCount = promptLogs.filter((l) => l.action === 'PROMPT_CLICK').length;
  const clickRate = recommendCount ? Math.round((clickCount / recommendCount) * 100) : 0;

  // --- 케어 알림 루프: 우울/불안 임계치 이상 사용자에게 알림 ---
  // 최근 7일간 감정 로그 fetch
  const { data: emotionLogs = [] } = await supabase
    .from('history_log')
    .select('user_id, emotion, created_at')
    .gte('created_at', weekAgoStr);
  // user별 우울/불안 count 집계
  const careMap: Record<string, number> = {};
  emotionLogs.forEach((log: any) => {
    if (log.emotion === 'depressed' || log.emotion === 'anxious') {
      careMap[log.user_id] = (careMap[log.user_id] || 0) + 1;
    }
  });
  // 임계치(3회) 이상인 user에게 알림 insert
  for (const [user_id, count] of Object.entries(careMap)) {
    if (count >= 3) {
      await supabase.from('user_notifications').insert({
        user_id,
        type: 'care',
        message: '최근 감정 기록에서 우울/불안이 자주 감지되어 마음챙김 컨텐츠를 추천합니다.',
        created_at: new Date().toISOString(),
        read: false,
      });
    }
  }

  return NextResponse.json({
    date: todayStr,
    inactiveCount: inactiveUsers.length,
    mau: mauUsers.length,
    newUserCount: newUsers.length,
    clickRate,
  });
}
