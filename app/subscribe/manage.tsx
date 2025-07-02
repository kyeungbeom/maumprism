'use client';
import React, { useEffect, useState } from 'react';

export default function SubscribeManagePage() {
  const [user, setUser] = useState<{ subscription: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then(setUser);
  }, []);

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    const res = await fetch('/api/stripe/cancel', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || '구독 해지 실패');
      return;
    }
    setSuccess(true);
    // 갱신된 구독 상태 반영
    setUser((u) => (u ? { ...u, subscription: 'free' } : u));
  };

  if (!user) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">구독 관리</h1>
      <div className="mb-4">
        <span className="font-semibold">현재 구독 상태:</span>
        <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-sm">
          {user.subscription === 'pro' ? 'Pro' : 'Free'}
        </span>
      </div>
      {user.subscription === 'pro' && (
        <button
          onClick={handleCancel}
          className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition mb-2"
          disabled={loading}
        >
          {loading ? '해지 처리 중...' : 'Pro 구독 해지'}
        </button>
      )}
      {success && (
        <div className="text-green-600 font-semibold text-center mt-2">구독이 해지되었습니다.</div>
      )}
      {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
    </div>
  );
}
