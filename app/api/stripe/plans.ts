import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });
    const plans = prices.data
      .filter((p) => p.type === 'recurring')
      .map((p) => {
        const product = p.product as Stripe.Product;
        return {
          id: p.id,
          name: product.name,
          price: p.unit_amount,
          currency: p.currency,
          interval: p.recurring?.interval,
          description: product.description,
          features: product.metadata.features ? product.metadata.features.split(',') : [],
        };
      });
    return NextResponse.json({ plans });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
