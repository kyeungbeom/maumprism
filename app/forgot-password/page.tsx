'use client';
import AppWidgetLayout from '../components/AppWidgetLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingWidget from '../components/LoadingWidget';
import ErrorWidget from '../components/ErrorWidget';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { mutate: sendReset, isPending: isLoading } = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setSent(true);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : '메일 발송에 실패했습니다.');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    sendReset(email);
  };

  if (isLoading)
    return (
      <AppWidgetLayout>
        <LoadingWidget />
      </AppWidgetLayout>
    );
  if (error)
    return (
      <AppWidgetLayout>
        <ErrorWidget message={error} onRetry={() => setError('')} />
      </AppWidgetLayout>
    );
  if (sent)
    return (
      <AppWidgetLayout>
        <div className="text-center text-blue-500">재설정 메일이 발송되었습니다!</div>
      </AppWidgetLayout>
    );

  return (
    <AppWidgetLayout>
      <form className="flex flex-col gap-4" onSubmit={handleSend}>
        <Input
          placeholder="이메일 주소"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl bg-white/80 backdrop-blur px-4 py-2"
        />
        <Button
          className="w-full bg-blue-400 hover:bg-blue-500 text-white rounded-xl"
          type="submit"
        >
          재설정 메일 발송
        </Button>
      </form>
    </AppWidgetLayout>
  );
}
