import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin')
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  const { data } = await supabase
    .from('history_log')
    .select('user_id, action, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  return NextResponse.json({ activity: data || [] });
}
