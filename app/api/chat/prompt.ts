import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

async function summarizeCounseling(supabase: any, userId: string) {
  // 최근 3회 상담 내용 요약
  const { data: sessions } = await supabase
    .from('counselings')
    .select('content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);
  if (!sessions || sessions.length === 0) return '';
  // 간단 요약: 최근 상담 날짜/주제/감정 등
  return sessions
    .map(
      (s: any, i: number) => `(${i + 1}) ${s.created_at?.slice(0, 10)}: ${s.content?.slice(0, 40)}`,
    )
    .join(' ');
}

async function analyzeEmotionPattern(supabase: any, userId: string) {
  // 최근 7일 감정 변화 패턴
  const { data: logs } = await supabase
    .from('emotion_cards')
    .select('emotion, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(7);
  if (!logs || logs.length === 0) return '';
  const emotions = logs.map((l: any) => l.emotion);
  const unique = Array.from(new Set(emotions));
  return `최근 감정 변화: ${unique.join(' → ')}`;
}

function getMbtiStyle(mbti: string) {
  if (!mbti) return '';
  if (mbti.startsWith('I')) return '내향적이고 신중한 화법,';
  if (mbti.startsWith('E')) return '외향적이고 적극적인 화법,';
  if (mbti.includes('F')) return '공감적이고 따뜻한 어조,';
  if (mbti.includes('T')) return '논리적이고 분석적인 어조,';
  return '';
}

function getGoalTone(goal: string) {
  if (!goal) return '';
  if (goal.includes('자신감')) return '격려와 긍정의 tone으로,';
  if (goal.includes('불안')) return '안정과 위로의 tone으로,';
  if (goal.includes('관계')) return '관계 개선에 초점을 맞춰,';
  return '';
}

async function getAdminTemplate(supabase: any, userId: string) {
  // 관리자 템플릿이 있으면 우선 적용
  const { data } = await supabase
    .from('gpt_prompt_templates')
    .select('prompt')
    .eq('user_id', userId)
    .single();
  return data?.prompt || null;
}

async function buildPrompt(supabase: any, userId: string) {
  // 1. 관리자 템플릿 우선 적용
  const adminTemplate = await getAdminTemplate(supabase, userId);
  if (adminTemplate) return adminTemplate;
  // 2. 프로필
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  // 3. 최근 감정 카드
  const { data: emotion } = await supabase
    .from('emotion_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  // 4. 상담 목표
  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  // 5. 상담 이력
  const { count: counselingCount } = await supabase
    .from('counselings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  // 6. 최근 상담 요약
  const counselingSummary = await summarizeCounseling(supabase, userId);
  // 7. 감정 변화 패턴
  const emotionPattern = await analyzeEmotionPattern(supabase, userId);
  // 8. MBTI별 화법
  const mbtiStyle = getMbtiStyle(profile?.mbti);
  // 9. 목표별 tone
  const goalTone = getGoalTone(goal?.title);

  let style = '';
  if (profile?.mbti) style += `MBTI: ${profile.mbti}, `;
  if (profile?.gender) style += `${profile.gender === 'male' ? '남성' : '여성'}, `;
  if (profile?.job) style += `${profile.job}, `;
  if (profile?.interests) style += `관심사: ${profile.interests}. `;
  if (goal?.title) style += `상담 목표: "${goal.title}". `;
  if (emotion?.emotion) style += `최근 감정: "${emotion.emotion}". `;

  const prompt = `당신은 심리상담 전문가 GPT입니다. 내담자 정보: ${style}상담 이력 ${counselingCount || 0}회. ${mbtiStyle} ${goalTone} ${emotionPattern} 최근 상담 요약: ${counselingSummary} 내담자의 성향과 감정에 맞춰 공감적이고 맞춤형으로, 너무 딱딱하지 않게 대화해 주세요.`;
  return prompt;
}

async function logPrompt(supabase: any, userId: string, prompt: string, action: string) {
  await supabase.from('logs').insert([
    {
      type: 'info',
      message: `[프롬프트 ${action}]`,
      meta: { user_id: userId, prompt },
      user_id: userId,
    },
  ]);
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  // 기존 프롬프트 불러오기
  const { data } = await supabase.from('gpt_prompts').select('*').eq('user_id', user.id).single();
  if (data?.prompt) return NextResponse.json({ prompt: data.prompt });
  // 없으면 새로 생성
  const prompt = await buildPrompt(supabase, user.id);
  await supabase.from('gpt_prompts').upsert({ user_id: user.id, prompt });
  await logPrompt(supabase, user.id, prompt, '생성');
  return NextResponse.json({ prompt });
}

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  const prompt = await buildPrompt(supabase, user.id);
  await supabase.from('gpt_prompts').upsert({ user_id: user.id, prompt });
  await logPrompt(supabase, user.id, prompt, '수정');
  return NextResponse.json({ prompt });
}
