// 내 활동 기반 주간/월간 성장 리포트
// Requires: Recharts, Supabase API endpoints
'use client';
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Spinner from '@/components/Spinner';
import { toast } from 'react-hot-toast';

interface ReportData {
  counselingCount: number;
  emotionTrend: { date: string; value: number }[];
  recordCardCount: number;
  goalProgress: { goal: string; progress: number }[];
}

export default function MyReportPage() {
  const [role, setRole] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((d) => setRole(d.role));
  }, []);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    fetch(`/api/my/report?period=${period}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('리포트 데이터 불러오기 실패');
        toast.error('리포트 데이터 불러오기 실패!');
        setLoading(false);
      });
  }, [role, period]);

  if (role === null || loading) return <Spinner />;
  if (role === 'guest')
    return <div className="p-8 text-center text-red-500 font-bold">로그인 후 이용 가능합니다.</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center">데이터 없음</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 성장 리포트</h1>
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${period === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setPeriod('week')}
        >
          주간
        </button>
        <button
          className={`px-4 py-2 rounded ${period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setPeriod('month')}
        >
          월간
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-lg font-semibold">상담 횟수</div>
          <div className="text-2xl font-bold mt-2">{data.counselingCount}</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-lg font-semibold">기록 카드</div>
          <div className="text-2xl font-bold mt-2">{data.recordCardCount}</div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">감정 상태 변화</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.emotionTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" name="감정 점수" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">목표 달성 현황</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.goalProgress} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="goal" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="progress" fill="#4ade80" name="달성률(%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
