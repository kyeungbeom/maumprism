import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('notifications_log')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
