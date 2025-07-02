import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  // 성장 지표 집계
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/analytics/growth');
  const growth = await res.json();
  await supabase.from('logs').insert([
    {
      type: 'info',
      message: '[CRON] 주간 성장 리포트',
      meta: growth,
      created_at: new Date(),
    },
  ]);
  return NextResponse.json(growth);
}
