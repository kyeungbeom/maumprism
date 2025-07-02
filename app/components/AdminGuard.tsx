'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((d) => {
        if (d.role !== 'admin') router.replace('/');
        else setRole('admin');
      });
  }, [router]);

  if (role !== 'admin') return <div className="p-8 text-center">관리자만 접근 가능합니다.</div>;
  return <>{children}</>;
}
