import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  // 프로필/감정카드 기반 추천
  const { data: profile } = await supabase
    .from('profiles')
    .select('mbti, hobbies, interests')
    .eq('id', user.id)
    .single();
  const { data: emotions } = await supabase
    .from('emotion_cards')
    .select('category')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  // 추천 로직 예시
  let suggestions: string[] = [];
  if (profile?.mbti) suggestions.push(`MBTI(${profile.mbti}) 맞춤 감정카드`);
  if (profile?.hobbies)
    suggestions = suggestions.concat(
      (profile.hobbies || []).map((h: string) => `${h} 관련 감정카드`),
    );
  if (emotions && emotions.length > 0)
    suggestions = suggestions.concat(emotions.map((e: any) => `${e.category} 감정카드 주제`));
  suggestions = Array.from(new Set(suggestions));
  return NextResponse.json({ suggestions });
}
