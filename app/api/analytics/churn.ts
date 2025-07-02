import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from('churn_risk_users')
    .select('*')
    .order('risk_score', { ascending: false })
    .order('last_active', { ascending: false });
  return NextResponse.json({ churn: data || [] });
}
