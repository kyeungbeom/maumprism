import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <img src="/logo.png" alt="마음 프리즘 로고" className="w-24 h-24 mb-6" />
      <h1 className="text-3xl font-bold mb-4 text-yellow-600">마음 프리즘에 오신 것을 환영합니다!</h1>
      <p className="text-lg text-gray-600 mb-2">모바일/PWA/감정 기록·분석 위젯 서비스</p>
      <span className="text-sm text-gray-400">Powered by Next.js · Supabase · Vercel</span>
    </div>
  );
} 