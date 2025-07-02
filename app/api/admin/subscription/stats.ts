import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

function getMonthlySummary(data: { price: number; created_at: string }[]) {
  const monthly: Record<string, { count: number; revenue: number }> = {};
  data.forEach(({ price, created_at }) => {
    const month = created_at.slice(0, 7); // YYYY-MM
    if (!monthly[month]) monthly[month] = { count: 0, revenue: 0 };
    monthly[month].count += 1;
    monthly[month].revenue += price;
  });
  // 정렬된 배열 반환
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const { data, error } = await supabase.from('subscriptions').select('price, created_at');
  if (error) return NextResponse.json({ error }, { status: 500 });
  const totalSubscribers = data.length;
  const totalRevenue = data.reduce((sum, d) => sum + (d.price || 0), 0);
  const monthlyStats = getMonthlySummary(data);
  return NextResponse.json({ totalSubscribers, totalRevenue, monthlyStats });
}
