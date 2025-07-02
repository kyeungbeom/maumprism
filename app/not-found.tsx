'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#fff8f0] p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm space-y-4">
        <img src="/logo.png" alt="Maum Prism Logo" className="w-20 h-20 mx-auto" />
        <h1 className="text-2xl font-bold text-[#f87171]">404 - 페이지를 찾을 수 없어요!</h1>
        <p className="text-[#666]">마음 프리즘 안에 없는 경로예요.<br />홈으로 돌아가 볼까요?</p>
        <Link href="/">
          <button className="mt-4 px-4 py-2 bg-[#f87171] text-white rounded-full hover:bg-[#ef4444] transition">
            홈으로 이동 💖
          </button>
        </Link>
      </div>
    </main>
  );
} 