'use client';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginWidget() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-4"
      >
        <Card className="rounded-2xl shadow-xl backdrop-blur-xl bg-white/70">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Image
              src="/maumprism-logo.png"
              alt="Maum Prism Logo"
              width={80}
              height={80}
              className="mb-2"
            />
            <h1 className="text-xl font-semibold text-center text-gray-800">
              마음프리즘에 로그인하기
            </h1>
            <Input
              placeholder="이메일 주소"
              type="email"
              className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
            />
            <Input
              placeholder="비밀번호"
              type="password"
              className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
            />
            <Button className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl">
              로그인
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              아직 계정이 없으신가요?{' '}
              <Link href="/signup" className="text-pink-500">
                회원가입
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
