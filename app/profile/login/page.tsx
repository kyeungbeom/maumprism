'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Supabase 로그인 API 호출 예시
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    router.push('/');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    // Google OAuth 시작
    const res = await fetch('/api/auth/google', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || 'Google 로그인 실패');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-4">로그인</h1>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded font-semibold bg-white hover:bg-gray-100 transition text-gray-700 mt-2"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.1 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.04l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"
              />
              <path
                fill="#FBBC05"
                d="M10.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.89 16.1 0 19.94 0 24c0 4.06.89 7.9 2.69 11.9l7.98-6.2z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.48 0 11.93-2.14 15.9-5.82l-7.19-5.6c-2.01 1.35-4.6 2.15-8.71 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.9 14.82 48 24 48z"
              />
            </g>
          </svg>
          Google로 로그인
        </button>
        <div className="text-center text-sm mt-2">
          계정이 없으신가요?{' '}
          <Link href="/profile/register" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </div>
        <div className="text-center text-xs mt-1">
          <Link href="/profile/reset" className="text-blue-500 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </form>
    </div>
  );
}
