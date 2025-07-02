'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorWidget({
  message = '문제가 발생했어요!',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-4xl mb-2">😢</div>
      <div className="text-sm text-gray-500 mb-4">{message}</div>
      {onRetry && (
        <Button onClick={onRetry} className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl">
          다시 시도
        </Button>
      )}
    </div>
  );
}
