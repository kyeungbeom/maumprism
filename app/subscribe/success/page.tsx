'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscribeSuccessPage() {
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/stripe/activate', { method: 'POST' }).then(() => setDone(true));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded shadow p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Pro 구독 완료</h1>
        <div className="mb-4">
          Pro 구독이 활성화되었습니다. 모든 프리미엄 기능을 이용하실 수 있습니다.
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          onClick={() => router.push('/')}
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
}
