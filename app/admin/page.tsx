import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';

export default async function AdminHome() {
  const session = await getServerSession();

  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">관리자 전용 페이지</h1>
      <ul className="space-y-4">
        <li>
          <Link href="/admin/users" className="text-blue-600 hover:underline font-semibold">
            사용자 목록 보기
          </Link>
        </li>
        <li>
          <Link href="/admin/insights" className="text-blue-600 hover:underline font-semibold">
            통계 리포트
          </Link>
        </li>
        <li>
          <Link href="/admin/roles" className="text-blue-600 hover:underline font-semibold">
            권한 관리
          </Link>
        </li>
      </ul>
    </div>
  );
}
