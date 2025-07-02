'use client';
import AppWidgetLayout from '../components/AppWidgetLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ErrorWidget from '../components/ErrorWidget';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  // const { mutate: signup, isPending: isSignupLoading } = useSignup();
  // const { data: session, isLoading: isSessionLoading } = useSession();

  useEffect(() => {
    // if (session) {
    //   router.replace('/dashboard');
    // }
  }, [router]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // signup(
    //   { email, password, name },
    //   {
    //     onError: (err: any) => setError(err.message || '회원가입에 실패했습니다.'),
    //   },
    // );
  };

  if (error)
    return (
      <AppWidgetLayout>
        <ErrorWidget message={error} onRetry={() => setError('')} />
      </AppWidgetLayout>
    );

  return (
    <AppWidgetLayout>
      <form className="flex flex-col gap-4" onSubmit={handleSignup}>
        <Input
          placeholder="이름"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Input
          placeholder="이메일 주소"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Button
          className="w-full bg-blue-400 hover:bg-blue-500 text-white rounded-xl"
          type="submit"
        >
          가입하기
        </Button>
        <div className="text-center mt-2">
          <Link href="/login" className="text-xs text-pink-500 hover:underline">
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </form>
    </AppWidgetLayout>
  );
}
