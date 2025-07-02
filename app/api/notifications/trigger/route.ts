import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { user_id, message, type } = await req.json();
  const { error } = await supabase.from('user_notifications').insert({
    user_id,
    message,
    type: type || 'care',
    created_at: new Date().toISOString(),
    read: false,
  });
  if (error) {
    return NextResponse.json({ success: false, error });
  }
  return NextResponse.json({ success: true });
}
