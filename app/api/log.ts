import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const body = await req.json();
  const { type = 'info', message, meta } = body;
  if (!message) return NextResponse.json({ error: '메시지 필요' }, { status: 400 });
  const { error } = await supabase.from('logs').insert([
    {
      type,
      message,
      meta,
      user_id: user?.id || null,
    },
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
