'use client';
import AppWidgetLayout from '../components/AppWidgetLayout';
import { Card, CardContent } from '@/components/ui/card';
import LoadingWidget from '../components/LoadingWidget';
import ErrorWidget from '../components/ErrorWidget';
import React from 'react';
import { useProtectedPage } from '../hooks/useProtectedPage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { session, isLoading: isSessionLoading } = useProtectedPage();
  const userId = session?.user?.id;

  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, plan, status, stripe_manage_url, stripe_cancel_url')
        .eq('user_id', userId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
  });

  if (isSessionLoading || isLoading)
    return (
      <AppWidgetLayout>
        <LoadingWidget />
      </AppWidgetLayout>
    );
  if (error)
    return (
      <AppWidgetLayout>
        <ErrorWidget message={error.message} />
      </AppWidgetLayout>
    );

  return (
    <AppWidgetLayout>
      <Card className="rounded-2xl bg-blue-50/60 mb-4">
        <CardContent className="py-6 text-center">
          <div className="text-lg font-bold mb-2">현재 요금제</div>
          <div className="text-xl text-pink-500 mb-4">{subscription?.plan || '무료 플랜'}</div>
          <div className="mb-2 text-gray-500">상태: {subscription?.status || '없음'}</div>
          <div className="flex gap-2 justify-center">
            {subscription?.stripe_manage_url && (
              <Link
                href={subscription.stripe_manage_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                구독 관리
              </Link>
            )}
            {subscription?.stripe_cancel_url && (
              <Link
                href={subscription.stripe_cancel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                구독 해지
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </AppWidgetLayout>
  );
}
