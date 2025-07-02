import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  const { report_id, old_content, new_content } = await req.json();
  await supabase
    .from('report_edit_history')
    .insert({ user_id: user.id, report_id, old_content, new_content });
  return NextResponse.json({ success: true });
}
