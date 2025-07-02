'use client';
import React, { useEffect, useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description?: string;
  features: string[];
}

export default function SubscribePage() {
  const [user, setUser] = useState<{ subscription?: string } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then(setUser);
    fetch('/api/stripe/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setPlans(data.plans || []);
        setLoading(false);
      })
      .catch(() => {
        setError('플랜 정보를 불러올 수 없습니다.');
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async (planId: string) => {
    setUpgradeLoading(true);
    setUpgradeError('');
    // Stripe Checkout 세션 생성 API 호출 (planId 전달)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: planId }),
    });
    const data = await res.json();
    setUpgradeLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      setUpgradeError(data.error || '결제 페이지 생성 실패');
    }
  };

  if (!user || loading) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">구독 플랜</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded shadow p-6 flex flex-col ${user.subscription === plan.name.toLowerCase() ? 'border-2 border-blue-500' : 'border'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold">{plan.name}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                {plan.interval === 'month'
                  ? '월간'
                  : plan.interval === 'year'
                    ? '연간'
                    : plan.interval}
              </span>
            </div>
            <div className="text-2xl font-bold mb-2">
              ₩{plan.price ? (plan.price / 100).toLocaleString() : 0}
            </div>
            {plan.description && (
              <div className="text-sm text-gray-600 mb-2">{plan.description}</div>
            )}
            <ul className="mb-4 text-sm text-gray-700 list-disc list-inside">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {user.subscription === plan.name.toLowerCase() ? (
              <div className="text-green-600 font-semibold text-center">현재 이용중</div>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                disabled={upgradeLoading}
              >
                {upgradeLoading ? '결제 페이지로 이동 중...' : `${plan.name}로 업그레이드`}
              </button>
            )}
            {upgradeError && (
              <div className="text-red-500 text-xs text-center mt-2">{upgradeError}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
