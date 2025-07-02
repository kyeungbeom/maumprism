'use client';
import { SessionProvider } from 'next-auth/react';
import ToastProvider from '@/components/ToastProvider';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';

const HIDE_HEADER_PATHS = [
  '/login',
  '/signup',
  '/register',
  '/profile/register',
  '/profile/reset',
  '/profile/login',
  '/profile/reset/new',
];

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = HIDE_HEADER_PATHS.some((path) => pathname?.startsWith(path));
  return (
    <SessionProvider>
      <ToastProvider />
      {!hideHeader && <Header />}
      {children}
    </SessionProvider>
  );
}
