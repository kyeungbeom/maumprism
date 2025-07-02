import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'react-hot-toast';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const {
    nickname,
    mbti,
    hobbies,
    interests,
    bio,
    contact,
    image_url,
    sns_instagram,
    sns_facebook,
    sns_twitter,
    job,
    region,
    birthdate,
    gender,
  } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabase
    .from('profiles')
    .update({
      nickname,
      mbti,
      hobbies,
      interests,
      bio,
      contact,
      image_url,
      sns_instagram,
      sns_facebook,
      sns_twitter,
      job,
      region,
      birthdate,
      gender,
    })
    .eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// failAlert를 inline 함수로 대체
const failAlert = (msg: string) => toast.error(msg);

// pendingNotifs는 async 함수(processNotifications) 내부에서만 참조
async function processNotifications() {
  const { data: pendingNotifs = [], error: pendingError } = await supabase
    .from('scheduled_notifications')
    .select('*')
    .eq('is_sent', false);
  if (pendingError) {
    failAlert(pendingError.message);
    return;
  }
  const notifications = pendingNotifs || [];
  for (const notif of notifications) {
    // A/B variant 메시지 분기
    const message =
      notif.variant === 'B' ? `B타입 메시지: ${notif.message}` : `A타입 메시지: ${notif.message}`;

    await supabase.from('users_notifications').insert({
      user_id: notif.user_id,
      message,
      created_at: new Date().toISOString(),
      type: 'care',
      variant: notif.variant,
    });
    // ...전송 결과 기록(별도 로직)
  }
}

// if (failRate >= 10) {
//   Sentry.captureMessage(`알림 전송 실패율 ${failRate}% 초과!`, 'error');
//   // 또는 이메일 발송 로직 추가
// }

const gptMessage: { type: string; status: string } = {
  type: 'update',
  status: 'success',
};

if (typeof window !== 'undefined' && window.parent?.postMessage) {
  window.parent.postMessage(gptMessage, '*');
}
