import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  // 최근 수정 히스토리 분석
  const { data: edits } = await supabase
    .from('report_edit_history')
    .select('old_content, new_content')
    .order('created_at', { ascending: false })
    .limit(20);
  // 간단 패턴 분석 예시
  let summary = '';
  if (edits && edits.length > 0) {
    const changes = edits.map((e) => e.new_content.length - e.old_content.length);
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    summary = `평균 수정 길이 변화: ${avgChange > 0 ? '+' : ''}${avgChange}`;
  }
  // GPT 프롬프트 예시
  const prompt = `리포트 수정 패턴: ${summary}. 다음 리포트 생성 시 이 패턴을 반영하세요.`;
  return NextResponse.json({ summary, prompt });
}
