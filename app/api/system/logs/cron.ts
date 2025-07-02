import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  // 예시: 최근 1주일간 에러/실패 로그 집계
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: errorLogs } = await supabase
    .from('logs')
    .select('*')
    .gte('created_at', since)
    .in('type', ['error', 'fail']);
  // 로그 요약 저장
  await supabase.from('logs').insert([
    {
      type: 'info',
      message: `[CRON] 주간 에러/실패 로그 집계`,
      meta: { errorLogs },
      created_at: new Date(),
    },
  ]);
  return NextResponse.json({ count: errorLogs?.length || 0 });
}
