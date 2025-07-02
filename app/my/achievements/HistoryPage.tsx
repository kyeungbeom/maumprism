'use client';
import React, { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';
import { toast } from 'react-hot-toast';

interface HistoryItem {
  icon: string;
  title: string;
  description: string;
  date: string;
}

export default function AchievementHistoryPage() {
  const [role, setRole] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((d) => setRole(d.role));
  }, []);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    fetch('/api/my/achievements/history')
      .then((res) => res.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          toast.error(d.error);
        } else {
          setHistory(d.history || []);
        }
      })
      .catch(() => {
        setError('히스토리 데이터 불러오기 실패');
        toast.error('히스토리 데이터 불러오기 실패');
      })
      .finally(() => setLoading(false));
  }, [role]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // ...
  };

  if (role === null || loading) return <Spinner />;
  if (role === 'guest')
    return <div className="p-8 text-center text-red-500 font-bold">로그인 후 이용 가능합니다.</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">업적 & 성장 히스토리</h1>
      <div className="space-y-4">
        {history.map((item, i) => (
          <div key={i} className="bg-white rounded shadow p-4 flex items-center gap-4">
            <div className="text-3xl">{item.icon}</div>
            <div>
              <div className="font-bold">{item.title}</div>
              <div className="text-gray-500 text-sm">{item.description}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(item.date).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="text-center text-gray-400 py-8">히스토리 없음</div>
        )}
      </div>
    </div>
  );
}
