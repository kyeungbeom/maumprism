import React from 'react';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import AnalyticsChart from './AnalyticsChart';

// 관리자 전용 Stripe 매출/구독 분석 대시보드
// Only accessible by admin. Uses /api/admin/analytics for data.
// Requires: recharts (npm i recharts)

export const dynamicMode = 'force-dynamic';

async function getAnalytics() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from('admin_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  // content 파싱 및 집계
  type ParsedAnalytics = {
    type?: string;
    clicks?: number;
    reactions?: number;
    user_type?: string;
    created_at: unknown;
  };
  const parsed: ParsedAnalytics[] = (data || []).map((r) => {
    let c: Partial<ParsedAnalytics> = {};
    try {
      c = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
    } catch {}
    return {
      type: c.type,
      clicks: c.clicks,
      reactions: c.reactions,
      user_type: c.user_type,
      created_at: r.created_at,
    };
  });
  // 예시 집계: 유형별 클릭률/반응률/시간대 분포/유저유형별 반응
  // 실제 데이터 구조에 맞게 집계 로직 조정 필요
  const byType: Record<string, { click: number; react: number; count: number }> = {};
  const byHour: Record<string, number> = {};
  const byUserType: Record<string, number> = {};
  parsed.forEach((r) => {
    if (r.type) {
      if (!byType[r.type]) byType[r.type] = { click: 0, react: 0, count: 0 };
      byType[r.type].click += r.clicks || 0;
      byType[r.type].react += r.reactions || 0;
      byType[r.type].count += 1;
    }
    if (r.created_at) {
      const hour = new Date(r.created_at as number).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    }
    if (r.user_type) {
      byUserType[r.user_type] = (byUserType[r.user_type] || 0) + 1;
    }
  });
  return { byType, byHour, byUserType };
}

export default async function AdminAnalyticsPage() {
  // 관리자 인증 (user.role === 'admin')
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') return notFound();

  const { byType, byHour, byUserType } = await getAnalytics();

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">알림 성과 분석</h1>
        <AnalyticsChart byType={byType} byHour={byHour} byUserType={byUserType} />
      </div>
    </AdminGuard>
  );
}
