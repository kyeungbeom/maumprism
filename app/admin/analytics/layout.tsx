import React from 'react';

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">관리자 매출/구독 분석</h1>
        {children}
      </div>
    </section>
  );
}
