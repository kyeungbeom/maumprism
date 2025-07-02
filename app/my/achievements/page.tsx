// 내 업적/칭호 페이지
'use client';
import React, { useEffect, useState } from 'react';
import AchievementModal from './AchievementModal';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { toast } from 'react-hot-toast';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  badge_type: string;
}
interface UserAchievement {
  id: string;
  achievement_id: string;
  achieved_at: string;
  is_title: boolean;
  achievement: Achievement;
}

export default function MyAchievementsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAchievement, setModalAchievement] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((d) => setRole(d.role));
  }, []);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    fetch('/api/my/achievements')
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setUserAchievements(d.userAchievements);
          setAllAchievements(d.allAchievements);
          const title = d.userAchievements.find(
            (ua: UserAchievement) => ua.is_title && ua.achievement.badge_type === '칭호',
          );
          setSelectedTitle(title?.achievement_id || '');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('업적 데이터 불러오기 실패');
        toast.error('업적 데이터 불러오기 실패!');
        setLoading(false);
      });
  }, [role]);

  // 업적 자동 체크 (최초 진입/활동 후)
  useEffect(() => {
    if (!role) return;
    fetch('/api/my/achievements/check', { method: 'POST' })
      .then((res) => res.json())
      .then((d) => {
        if (d.newAchievements && d.newAchievements.length > 0) {
          setModalAchievement(d.newAchievements[0]);
          setModalOpen(true);
        }
      });
  }, [role]);

  const handleSelectTitle = async (achievementId: string) => {
    await fetch('/api/my/achievements/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId }),
    });
    setSelectedTitle(achievementId);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // ...
  };

  if (role === null || loading) return <Spinner />;
  if (role === 'guest')
    return <div className="p-8 text-center text-red-500 font-bold">로그인 후 이용 가능합니다.</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const achievedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const titleAchievements = allAchievements.filter((a) => a.badge_type === '칭호');

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <AchievementModal
        achievement={modalAchievement}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <h1 className="text-2xl font-bold mb-6">내 업적 & 칭호</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded shadow"
        onClick={() => router.push('/my/achievements/ranking')}
      >
        업적 랭킹 보기
      </button>
      <div className="mb-8">
        <div className="font-semibold mb-2">대표 칭호 선택</div>
        <div className="flex flex-wrap gap-2">
          {titleAchievements.map((a) => (
            <button
              key={a.id}
              className={`px-3 py-2 rounded shadow flex items-center gap-2 ${selectedTitle === a.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} ${achievedIds.has(a.id) ? '' : 'opacity-40 cursor-not-allowed'}`}
              disabled={!achievedIds.has(a.id)}
              onClick={() => handleSelectTitle(a.id)}
            >
              <span className="text-xl">{a.icon}</span> {a.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {allAchievements.map((a) => {
          const achieved = achievedIds.has(a.id);
          const userAch = userAchievements.find((ua) => ua.achievement_id === a.id);
          return (
            <div
              key={a.id}
              className={`rounded shadow p-4 flex flex-col items-center ${achieved ? 'bg-white' : 'bg-gray-100 opacity-50'} cursor-pointer`}
              onClick={() => {
                setModalAchievement({
                  ...a,
                  achieved_at: userAch?.achieved_at,
                });
                setModalOpen(true);
              }}
            >
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="font-bold mb-1">{a.name}</div>
              <div className="text-xs text-gray-500 mb-2">{a.badge_type}</div>
              <div className="text-sm text-center mb-2">{a.description}</div>
              {achieved && <div className="text-xs text-green-500">획득!</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
