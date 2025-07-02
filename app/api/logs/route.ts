import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 role key는 서버사이드에서만 사용! 노출 주의
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const { emotion, note } = await req.json();
  if (!emotion) {
    return NextResponse.json({ error: 'Emotion is required' }, { status: 400 });
  }
  // note XSS 방지 (간단한 태그 제거)
  const sanitizedNote = typeof note === 'string' ? note.replace(/<[^>]*>?/gm, '') : '';
  const { data, error } = await supabase
    .from('emotion_logs')
    .insert([{ emotion, note: sanitizedNote }]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Emotion saved', data }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
