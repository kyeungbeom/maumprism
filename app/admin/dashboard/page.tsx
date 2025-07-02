'use client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import DashboardCard from '@/components/DashboardCard';
import SubscriptionChart from '@/components/SubscriptionChart';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setRole(data.role));
  }, []);

  const { data, isLoading } = useSWR(
    role === 'admin' ? '/api/admin/subscription/stats' : null,
    fetcher,
  );

  if (role === null) return <div className="p-8 text-center">권한 확인 중...</div>;
  if (role !== 'admin')
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded shadow p-8 max-w-xs w-full text-center">
          <div className="text-red-500 font-bold text-lg mb-2">접근 불가</div>
          <div className="mb-4">관리자만 접근 가능한 페이지입니다.</div>
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 이동
          </Link>
        </div>
      </div>
    );
  if (isLoading || !data) return <div className="p-8">로딩중...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <DashboardCard title="총 구독자 수" value={data.totalSubscribers} />
        <DashboardCard title="총 매출" value={`₩${data.totalRevenue.toLocaleString()}`} />
      </div>
      <SubscriptionChart data={data.monthlyStats} />
    </div>
  );
}
