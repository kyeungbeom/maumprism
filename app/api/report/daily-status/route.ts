import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST() {
  const since = new Date();
  since.setDate(since.getDate() - 1); // 최근 24시간

  // 1. care 알림 전송 수 점검
  const { data: careNotifs, error: careError } = await supabase
    .from('users_notifications')
    .select('id')
    .eq('type', 'care')
    .gte('created_at', since.toISOString());

  // 2. 예약된 알림 중 미전송 항목 점검
  const { data: pendingNotifs, error: pendingError } = await supabase
    .from('scheduled_notifications')
    .select('id')
    .eq('is_sent', false);

  if (careError || pendingError) {
    return NextResponse.json(
      { success: false, error: careError?.message || pendingError?.message },
      { status: 500 },
    );
  }

  const report = {
    status: careNotifs.length > 0 && pendingNotifs.length === 0 ? '✅ 정상' : '⚠️ 점검 필요',
    sent: careNotifs.length,
    pending: pendingNotifs.length,
    generated_at: new Date().toISOString(),
  };

  // (선택) 리포트를 로그용 테이블에 저장하거나, admin에 알림 전송 가능
  await supabase.from('admin_reports').insert({
    report_type: 'daily_status',
    content: JSON.stringify(report),
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, report });
}
