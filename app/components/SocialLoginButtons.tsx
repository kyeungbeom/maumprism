'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { SiKakaotalk } from 'react-icons/si';

export default function SocialLoginButtons({
  onGoogle,
  onKakao,
}: {
  onGoogle?: () => void;
  onKakao?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50"
        onClick={onGoogle}
      >
        <FcGoogle size={20} /> Google로 로그인
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-2 bg-yellow-300 text-black border-gray-200 hover:bg-yellow-200"
        onClick={onKakao}
      >
        <SiKakaotalk size={20} /> Kakao로 로그인
      </Button>
    </div>
  );
}
