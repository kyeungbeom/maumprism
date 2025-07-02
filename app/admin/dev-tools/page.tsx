// 관리자 전용 개발자 로그/에러 추적 도구
// Requires: /api/admin/logs
'use client';
import React, { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';

interface Log {
  id: string;
  type: string;
  message: string;
  created_at: string;
  user_id?: string;
  meta?: Record<string, unknown>;
}

export default function DevToolsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((d) => setRole(d.role));
  }, []);

  useEffect(() => {
    if (role !== 'admin') return;
    setLoading(true);
    let url = '/api/admin/logs?';
    if (type) url += `type=${type}&`;
    if (from) url += `from=${from}&`;
    if (to) url += `to=${to}&`;
    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setLogs(d.logs || []);
        setLoading(false);
      })
      .catch(() => {
        setError('로그 불러오기 실패');
        setLoading(false);
      });
  }, [role, type, from, to]);

  if (role === null || loading) return <div className="p-8 text-center">로딩중...</div>;
  if (role !== 'admin')
    return <div className="p-8 text-center text-red-500 font-bold">관리자만 접근 가능합니다.</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <AdminGuard>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">개발자 로그/에러 추적</h1>
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            className="border rounded px-2 py-1"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">전체 유형</option>
            <option value="info">info</option>
            <option value="error">error</option>
          </select>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">날짜</th>
                <th className="px-3 py-2 text-left">유형</th>
                <th className="px-3 py-2 text-left">메시지</th>
                <th className="px-3 py-2 text-left">유저</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className={log.type === 'error' ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-bold">{log.type}</td>
                  <td className="px-3 py-2 break-all max-w-xs">{log.message}</td>
                  <td className="px-3 py-2">{log.user_id || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    로그 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
