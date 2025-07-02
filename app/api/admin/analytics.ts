import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

function getMonthKey(ts: number) {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET() {
  try {
    // 1. 전체 결제 내역
    const payments = await stripe.paymentIntents.list({ limit: 100 });
    const totalRevenue = payments.data.reduce(
      (sum, p) => sum + (p.status === 'succeeded' ? p.amount : 0),
      0,
    );
    // 2. 월별 매출
    const monthlyRevenue: Record<string, number> = {};
    payments.data.forEach((p) => {
      if (p.status === 'succeeded') {
        const key = getMonthKey(p.created);
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + p.amount;
      }
    });
    // 3. 구독자/신규가입자/취소율
    const subscriptions = await stripe.subscriptions.list({ limit: 100 });
    const now = Date.now() / 1000;
    const activeSubscribers = subscriptions.data.filter((s) => s.status === 'active').length;
    const newSubscribers = subscriptions.data.filter(
      (s) => s.status === 'active' && now - s.created < 2592000,
    ).length; // 최근 30일
    const canceled = subscriptions.data.filter((s) => s.status === 'canceled').length;
    const churnRate = subscriptions.data.length ? (canceled / subscriptions.data.length) * 100 : 0;
    // 4. ARPU (평균 수익)
    const arpu = subscriptions.data.length ? totalRevenue / subscriptions.data.length : 0;
    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      activeSubscribers,
      newSubscribers,
      churnRate,
      arpu,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : e }, { status: 500 });
  }
}
