'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#fff8f0] p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm space-y-4">
        <img src="/logo.png" alt="Maum Prism Logo" className="w-20 h-20 mx-auto" />
        <h1 className="text-2xl font-bold text-[#fbbf24]">앗! 무언가 잘못되었어요 💥</h1>
        <p className="text-[#666]">잠시 문제가 발생했어요.<br />잠시 후 다시 시도하거나 홈으로 돌아가 주세요.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-[#fbbf24] text-white rounded-full hover:bg-[#f59e0b] transition"
          >
            다시 시도 🔁
          </button>
          <Link href="/">
            <button className="mt-4 px-4 py-2 bg-[#60a5fa] text-white rounded-full hover:bg-[#3b82f6] transition">
              홈으로 이동 🏡
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
} 