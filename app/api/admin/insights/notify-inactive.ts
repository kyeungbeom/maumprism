import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { type, template } = await req.json();

  // 7일 이상 미접속 사용자 추출
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const { data: users = [] } = await supabase.from('users').select('id, email, name');
  const { data: weekActiveRaw } = await supabase
    .from('history_log')
    .select('user_id')
    .gte('created_at', weekAgoStr);
  const weekActiveUserIds = new Set((weekActiveRaw || []).map((u) => u.user_id));
  let weekInactiveUsers = users.filter((u) => !weekActiveUserIds.has(u.id));

  // 최근 추천 클릭 없는 사용자만 필터링
  const { data: promptLogs = [] } = await supabase
    .from('history_log')
    .select('user_id, action, created_at')
    .gte('created_at', weekAgoStr);
  const clickedUserIds = new Set(
    promptLogs.filter((l) => l.action === 'PROMPT_CLICK').map((l) => l.user_id),
  );
  weekInactiveUsers = weekInactiveUsers.filter((u) => !clickedUserIds.has(u.id));

  // 알림 insert (mock) + notifications_log 기록
  for (const u of weekInactiveUsers) {
    await supabase.from('notifications').insert({
      user_id: u.id,
      type,
      message: template,
      sent_at: new Date().toISOString(),
      status: 'sent',
    });
    await supabase.from('notifications_log').insert({
      user_id: u.id,
      channel: type,
      sent_at: new Date().toISOString(),
      result: 'success',
    });
    // 실제 푸시/이메일 전송은 별도 구현 필요
  }

  return NextResponse.json({
    message: `알림 전송 완료 (${weekInactiveUsers.length}명)`,
  });
}
