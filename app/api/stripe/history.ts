import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Stripe 고객 ID는 user.stripe_customer_id에 저장되어 있다고 가정
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();
  if (userError || !userData?.stripe_customer_id)
    return NextResponse.json({ error: 'Stripe 고객 정보 없음' }, { status: 400 });
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: userData.stripe_customer_id,
      limit: 20,
    });
    const payments = paymentIntents.data.map((p) => {
      const charge = (p as any).charges?.data?.[0];
      return {
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        created: p.created,
        payment_method: charge?.payment_method_details?.type || '',
        status: p.status,
        receipt_url: charge?.receipt_url || '',
        description: charge?.description || p.description || '',
      };
    });
    return NextResponse.json({ payments });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
