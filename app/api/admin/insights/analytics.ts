import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function getMonthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // 1. 전체 사용자
  const { data: users = [] } = await supabase.from('users').select('id, created_at, email, name');

  // 2. 활동 로그 (history_log)
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthAgoStr = monthAgo.toISOString().slice(0, 10);

  // DAU/MAU
  const { data: dauRaw } = await supabase
    .from('history_log')
    .select('user_id')
    .gte('created_at', todayStr);
  const dauUsers = Array.from(new Set((dauRaw || []).map((u) => u.user_id)));
  const { data: mauRaw } = await supabase
    .from('history_log')
    .select('user_id')
    .gte('created_at', monthAgoStr);
  const mauUsers = Array.from(new Set((mauRaw || []).map((u) => u.user_id)));

  // 3. 비활성 사용자 (30일간 활동 없음)
  const activeUserIds = new Set(mauUsers);
  const inactiveUsers = users.filter((u) => !activeUserIds.has(u.id));
  const inactiveCount = inactiveUsers.length;
  const inactiveRate = users.length ? Math.round((inactiveCount / users.length) * 100) : 0;

  // 4. 월별 신규 가입자
  const joinByMonth = {};
  users.forEach((u) => {
    const key = getMonthKey(u.created_at);
    joinByMonth[key] = (joinByMonth[key] || 0) + 1;
  });

  // 5. 결제 내역
  const { data: payments = [] } = await supabase
    .from('payments')
    .select('user_id, amount, paid_at');
  const paymentByMonth = {};
  payments.forEach((p) => {
    if (!p.paid_at) return;
    const key = getMonthKey(p.paid_at);
    paymentByMonth[key] = (paymentByMonth[key] || 0) + 1;
  });

  // 6. 프롬프트 추천/클릭/응답률
  const { data: promptLogs = [] } = await supabase
    .from('history_log')
    .select('user_id, action, created_at');
  const recommendCount = promptLogs.filter((l) => l.action === 'PROMPT_RECOMMEND').length;
  const clickCount = promptLogs.filter((l) => l.action === 'PROMPT_CLICK').length;
  const replyCount = promptLogs.filter((l) => l.action === 'PROMPT_REPLY').length;
  const clickRate = recommendCount ? Math.round((clickCount / recommendCount) * 100) : 0;
  const replyRate = recommendCount ? Math.round((replyCount / recommendCount) * 100) : 0;

  // 7. 7일 이상 미접속 사용자
  const { data: weekActiveRaw } = await supabase
    .from('history_log')
    .select('user_id')
    .gte('created_at', weekAgoStr);
  const weekActiveUserIds = new Set((weekActiveRaw || []).map((u) => u.user_id));
  const weekInactiveUsers = users.filter((u) => !weekActiveUserIds.has(u.id));

  return NextResponse.json({
    totalUsers: users.length,
    inactiveCount,
    inactiveRate,
    joinByMonth,
    paymentByMonth,
    DAU: dauUsers.length,
    MAU: mauUsers.length,
    prompt: {
      recommendCount,
      clickCount,
      replyCount,
      clickRate,
      replyRate,
    },
    weekInactiveUsers,
    weekInactiveCount: weekInactiveUsers.length,
  });
}
