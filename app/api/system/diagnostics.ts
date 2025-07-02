import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  // 누락된 프로필
  const { data: users } = await supabase.from('auth.users').select('id');
  const { data: profiles } = await supabase.from('profiles').select('id');
  const missingProfiles = (users || []).filter((u) => !(profiles || []).some((p) => p.id === u.id));
  // 누락된 감정카드
  const { data: emotionCards } = await supabase.from('emotion_cards').select('user_id');
  const missingEmotion = (users || []).filter(
    (u) => !(emotionCards || []).some((e) => e.user_id === u.id),
  );
  // 누락된 성장 리포트
  const { data: reports } = await supabase.from('growth_report').select('user_id');
  const missingReports = (users || []).filter(
    (u) => !(reports || []).some((r) => r.user_id === u.id),
  );
  const result = {
    missingProfiles: missingProfiles.map((u) => u.id),
    missingEmotionCards: missingEmotion.map((u) => u.id),
    missingGrowthReports: missingReports.map((u) => u.id),
    checkedAt: new Date().toISOString(),
  };
  await supabase.from('diagnostics_reports').insert([{ result, checked_at: new Date() }]);
  return NextResponse.json(result);
}
