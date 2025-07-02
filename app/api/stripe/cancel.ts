import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Stripe 구독 ID는 user.stripe_subscription_id에 저장되어 있다고 가정
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .single();
  if (userError || !userData?.stripe_subscription_id)
    return NextResponse.json({ error: 'Stripe 구독 정보 없음' }, { status: 400 });
  try {
    await stripe.subscriptions.update(userData.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    await supabase.from('users').update({ subscription: 'free' }).eq('id', user.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
