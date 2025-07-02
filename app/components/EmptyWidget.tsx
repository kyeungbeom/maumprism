'use client';
import React from 'react';

export default function EmptyWidget({ message = '표시할 데이터가 없어요.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-3xl mb-2">✨</div>
      <div className="text-sm text-gray-400">{message}</div>
    </div>
  );
}
