'use client';
import React, { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';
import { toast } from 'react-hot-toast';

interface RankingItem {
  user_id: string;
  profile_image?: string;
  nickname: string;
  main_title?: string;
  achievement_count: number;
}

export default function AchievementRankingPage() {
  const [role, setRole] = useState<string | null>(null);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
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
    fetch('/api/rankings/achievements')
      .then((res) => res.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          toast.error(d.error);
        } else {
          setRankings(d.rankings || []);
        }
      })
      .catch(() => {
        setError('랭킹 데이터 불러오기 실패');
        toast.error('랭킹 데이터 불러오기 실패');
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
      <h1 className="text-2xl font-bold mb-6">업적 랭킹 TOP 50</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">순위</th>
              <th className="px-3 py-2">프로필</th>
              <th className="px-3 py-2">닉네임</th>
              <th className="px-3 py-2">칭호</th>
              <th className="px-3 py-2">업적 수</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r, i) => (
              <tr key={r.user_id} className={i < 3 ? 'bg-yellow-50 font-bold' : ''}>
                <td className="px-3 py-2 text-center">{i + 1}</td>
                <td className="px-3 py-2 text-center">
                  <img
                    src={r.profile_image || '/default-profile.png'}
                    alt="프로필"
                    className="w-8 h-8 rounded-full mx-auto"
                  />
                </td>
                <td className="px-3 py-2">{r.nickname}</td>
                <td className="px-3 py-2">{r.main_title || '-'}</td>
                <td className="px-3 py-2 text-center">{r.achievement_count}</td>
              </tr>
            ))}
            {rankings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  랭킹 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
