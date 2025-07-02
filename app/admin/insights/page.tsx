'use client';
import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminGuard from '@/components/AdminGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';
import useSWR from 'swr';

const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), {
  ssr: false,
});
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), {
  ssr: false,
});

function getMonthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default async function AdminInsightsPage() {
  const session = await getServerSession();
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/');
  }

  // 서버에서 기본 데이터 fetch (전체 기간)
  const { data: users = [] } = await supabaseAdmin
    .from('users')
    .select('id, created_at, subscription_status, email, name');
  const { data: payments = [] } = await supabaseAdmin
    .from('payments')
    .select('user_id, amount, paid_at');
  // Prisma에서 유저 이름/이메일 보강 (user_id 기준)
  const userMap: Record<string, { name: string; email: string }> = {};
  for (const u of users) {
    userMap[u.id] = { name: u.name || '', email: u.email };
  }

  // 클라이언트 컴포넌트로 필터/다운로드/차트/테이블 처리 위임
  return <AdminInsightsClient users={users} payments={payments} userMap={userMap} />;
}

function AdminInsightsClient({
  users,
  payments,
  userMap,
}: {
  users: unknown[];
  payments: unknown[];
  userMap: Record<string, { name: string; email: string }>;
}) {
  'use client';
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [filteredPayments, setFilteredPayments] = useState(payments);

  // AI 분석 통계 fetch
  const { data: aiStats } = useSWR('/api/admin/insights/analytics', fetcher);
  // 알림 이력 fetch
  const { data: notifyLog } = useSWR('/api/admin/insights/notifications-log', fetcher);

  // 알림 루프 설정 state
  const [notifyType, setNotifyType] = useState<'push' | 'email'>('push');
  const [notifyTemplate, setNotifyTemplate] = useState('안녕하세요! 오랜만에 방문해 주세요 :)');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  useEffect(() => {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    setFilteredUsers(
      (users as unknown[]).filter((u) => {
        const d = new Date((u as any).created_at);
        if (s && d < s) return false;
        if (e && d > e) return false;
        return true;
      }),
    );
    setFilteredPayments(
      (payments as unknown[]).filter((p) => {
        const d = new Date((p as any).paid_at);
        if (s && d < s) return false;
        if (e && d > e) return false;
        return true;
      }),
    );
  }, [start, end, users, payments]);

  // 1. 요약 정보
  const now = new Date();
  const users30 = (filteredUsers as unknown[]).filter(
    (u) => new Date((u as any).created_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  );
  const paidUsers = (filteredUsers as unknown[]).filter((u) => (u as any).subscription_status === 'paid');
  const totalSales = (filteredPayments as unknown[]).reduce((sum: number, p) => sum + ((p as any).amount || 0), 0);

  // 2. 월별 매출
  const salesByMonth: Record<string, number> = {};
  (filteredPayments as unknown[]).forEach((p) => {
    if (!(p as any).paid_at) return;
    const key = getMonthKey((p as any).paid_at);
    salesByMonth[key] = (salesByMonth[key] || 0) + ((p as any).amount || 0);
  });
  const salesChartData = Object.entries(salesByMonth).map(([month, amount]) => ({ month, amount }));

  // 3. 구독 상태 비율
  const subCounts: Record<string, number> = {};
  (filteredUsers as unknown[]).forEach((u) => {
    const key = (u as any).subscription_status || 'free';
    subCounts[key] = (subCounts[key] || 0) + 1;
  });
  const pieData = Object.entries(subCounts).map(([status, value]) => ({
    name: status === 'paid' ? '유료' : '무료',
    value,
  }));
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  // 4. 사용자별 결제 내역 테이블
  const paymentRows = (filteredPayments as unknown[]).map((p) => ({
    name: userMap[(p as any).user_id]?.name || '',
    email: userMap[(p as any).user_id]?.email || '',
    amount: (p as any).amount,
    paid_at: (p as any).paid_at ? new Date((p as any).paid_at).toLocaleString() : '',
  }));

  // 5. CSV 다운로드
  function handleDownloadCSV() {
    const stats = [
      { 항목: '전체 사용자', 값: filteredUsers.length },
      { 항목: '30일 내 가입자', 값: users30.length },
      { 항목: '유료 구독자', 값: paidUsers.length },
      { 항목: '총 매출', 값: totalSales },
    ];
    const csv =
      '--- 통계 요약 ---\n' +
      Papa.unparse(stats) +
      '\n--- 결제 내역 ---\n' +
      Papa.unparse(paymentRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 비활성 사용자 알림 전송
  async function handleSendInactiveNotify() {
    setNotifyLoading(true);
    setNotifyResult(null);
    const res = await fetch('/api/admin/insights/notify-inactive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: notifyType,
        template: notifyTemplate,
      }),
    });
    const data = await res.json();
    setNotifyLoading(false);
    setNotifyResult(data.message || '알림 전송 완료');
  }

  return (
    <AdminGuard>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>
        <div className="flex flex-col sm:flex-row gap-2 mb-6 items-center">
          <label className="flex items-center gap-1">
            시작일
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1">
            종료일
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
          <button
            onClick={handleDownloadCSV}
            className="ml-auto px-4 py-1 bg-green-500 text-white rounded"
          >
            CSV 다운로드
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded p-4 text-center">
            <div className="text-gray-500">전체 사용자</div>
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
          </div>
          <div className="bg-gray-50 rounded p-4 text-center">
            <div className="text-gray-500">30일 내 가입자</div>
            <div className="text-2xl font-bold">{users30.length}</div>
          </div>
          <div className="bg-gray-50 rounded p-4 text-center">
            <div className="text-gray-500">유료 구독자</div>
            <div className="text-2xl font-bold">{paidUsers.length}</div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">월별 매출</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">구독 상태 비율</h2>
          <div className="w-full h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">사용자별 결제 내역</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">이름</th>
                  <th className="border px-2 py-1">이메일</th>
                  <th className="border px-2 py-1">금액</th>
                  <th className="border px-2 py-1">결제일</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.map((row, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{row.name}</td>
                    <td className="border px-2 py-1">{row.email}</td>
                    <td className="border px-2 py-1 text-right">{row.amount}</td>
                    <td className="border px-2 py-1">{row.paid_at}</td>
                  </tr>
                ))}
                {paymentRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-4">
                      결제 내역 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* AI 분석 카드 */}
        {aiStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded p-4 text-center">
              <div className="text-gray-500">비활성 사용자</div>
              <div className="text-2xl font-bold">
                {aiStats.inactiveCount}명 ({aiStats.inactiveRate}%)
              </div>
            </div>
            <div className="bg-blue-50 rounded p-4 text-center">
              <div className="text-gray-500">MAU / DAU</div>
              <div className="text-2xl font-bold">
                {aiStats.MAU} / {aiStats.DAU}
              </div>
            </div>
            <div className="bg-blue-50 rounded p-4 text-center">
              <div className="text-gray-500">프롬프트 클릭률/응답률</div>
              <div className="text-2xl font-bold">
                {aiStats.prompt.clickRate}% / {aiStats.prompt.replyRate}%
              </div>
            </div>
          </div>
        )}
        {/* 성장 분석 차트 */}
        {aiStats && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded p-4">
              <h2 className="text-lg font-semibold mb-2">월별 신규 가입자</h2>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(aiStats.joinByMonth).map(([month, count]) => ({
                      month,
                      count,
                    }))}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded p-4">
              <h2 className="text-lg font-semibold mb-2">월별 결제 건수</h2>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(aiStats.paymentByMonth).map(([month, count]) => ({
                      month,
                      count,
                    }))}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {/* 비활성 사용자 알림 루프 UI */}
        {aiStats && (
          <div className="bg-yellow-50 rounded p-4 mb-8">
            <h2 className="text-lg font-semibold mb-2">비활성 사용자 자동 알림</h2>
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-2">
              <select
                value={notifyType}
                onChange={(e) => setNotifyType(e.target.value as any)}
                className="border rounded px-2 py-1"
              >
                <option value="push">푸시</option>
                <option value="email">이메일</option>
              </select>
              <input
                type="text"
                value={notifyTemplate}
                onChange={(e) => setNotifyTemplate(e.target.value)}
                className="border rounded px-2 py-1 flex-1"
                placeholder="알림 템플릿 입력"
              />
              <button
                onClick={handleSendInactiveNotify}
                disabled={notifyLoading}
                className="px-4 py-1 bg-blue-500 text-white rounded"
              >
                {notifyLoading ? '전송 중...' : '비활성 사용자 알림 전송'}
              </button>
            </div>
            {notifyResult && <div className="text-green-600 text-sm mt-1">{notifyResult}</div>}
            <div className="text-xs text-gray-500 mt-2">
              7일 이상 미접속 사용자에게 자동 알림을 보냅니다.
            </div>
          </div>
        )}
        {/* 알림 전송 이력 테이블 */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-2">알림 전송 이력</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">사용자ID</th>
                  <th className="border px-2 py-1">채널</th>
                  <th className="border px-2 py-1">전송일시</th>
                  <th className="border px-2 py-1">결과</th>
                </tr>
              </thead>
              <tbody>
                {notifyLog && notifyLog.length > 0 ? (
                  notifyLog.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{row.user_id}</td>
                      <td className="border px-2 py-1">{row.channel}</td>
                      <td className="border px-2 py-1">{new Date(row.sent_at).toLocaleString()}</td>
                      <td className="border px-2 py-1">{row.result}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-4">
                      이력 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
