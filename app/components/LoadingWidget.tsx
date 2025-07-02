'use client';
import React from 'react';

export default function LoadingWidget({
  message = '잠시만 기다려주세요...',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-10 h-10 border-4 border-pink-300 border-t-blue-300 rounded-full animate-spin mb-4" />
      <div className="text-sm text-gray-500">{message}</div>
    </div>
  );
}
