import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  // 랜덤 할당
  const version = Math.random() < 0.5 ? 'prompt_v1' : 'prompt_v2';
  await supabase
    .from('experiments')
    .upsert({ user_id: user.id, experiment: 'report_prompt', version });
  return NextResponse.json({ version });
}
