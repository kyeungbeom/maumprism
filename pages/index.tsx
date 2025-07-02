import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <h1 className="mb-4 text-3xl font-bold text-yellow-600">마음 프리즘에 오신 것을 환영합니다!</h1>
      <p className="mb-2 text-lg text-gray-600">모바일/PWA/감정 기록·분석 위젯 서비스</p>
      <span className="text-sm text-gray-400">Powered by Next.js · Supabase · Vercel</span>
    </div>
  );
} 