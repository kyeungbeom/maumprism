'use client';
import React from 'react';
import Image from 'next/image';

export default function AppWidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100 font-sans">
      <div className="w-full max-w-sm p-4">
        <div className="flex flex-col items-center">
          <Image
            src="/maumprism-logo.png"
            alt="마음프리즘 로고"
            width={64}
            height={64}
            className="mb-2"
          />
          <div className="text-base font-medium text-gray-700 mb-4">
            당신의 마음을 투영하는 프리즘
          </div>
        </div>
        <div className="rounded-2xl shadow-md bg-white/70 backdrop-blur-xl p-6">{children}</div>
      </div>
    </div>
  );
}
