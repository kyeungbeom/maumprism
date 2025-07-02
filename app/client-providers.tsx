'use client';
import React from 'react';
import ToastProvider from '@/components/ToastProvider';
import UserNav from '@/components/UserNav';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <UserNav />
      {children}
    </ToastProvider>
  );
}
