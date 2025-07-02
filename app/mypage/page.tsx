'use client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { updateName } from '../actions/updateName';
import React, { useState } from 'react';

export default async function MyPage() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect('/login');
  }
  const email = session.user.email;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect('/login');
  }

  // 클라이언트 컴포넌트에서 이름 상태 관리
  return <MyPageClient user={user} />;
}

function MyPageClient({
  user,
}: {
  user: { email: string; name: string | null; createdAt: string | Date };
}) {
  const [name, setName] = useState(user.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateName(formData);
      if (result.ok) {
        setName(result.name);
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || '오류 발생');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">마이페이지</h1>
      <div className="mb-4">
        <div className="text-gray-600">이메일</div>
        <div className="font-mono">{user.email}</div>
      </div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input type="hidden" name="email" value={user.email} />
        <div className="text-gray-600">이름</div>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? '저장 중...' : '이름 저장'}
        </button>
        {success && <div className="text-green-600 mt-2">이름이 저장되었습니다.</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <div className="mb-2">
        <div className="text-gray-600">가입일</div>
        <div>
          {typeof user.createdAt === 'string'
            ? user.createdAt
            : user.createdAt.toLocaleString?.() || user.createdAt.toString()}
        </div>
      </div>
    </div>
  );
}
