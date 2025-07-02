import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: Request) {
  let priceId = process.env.STRIPE_DEFAULT_PRICE_ID;
  try {
    const body = await req.json();
    if (body.priceId) priceId = body.priceId;
  } catch {}
  // 실제 환경에서는 사용자 인증 및 userId 확인 필요
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe/cancel`,
  });
  return NextResponse.json({ url: session.url });
}
