'use client';
import AppWidgetLayout from '../components/AppWidgetLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingWidget from '../components/LoadingWidget';
import EmptyWidget from '../components/EmptyWidget';
import ErrorWidget from '../components/ErrorWidget';
import React from 'react';
import { useProtectedPage } from '../hooks/useProtectedPage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { session, isLoading: isSessionLoading } = useProtectedPage();
  const router = useRouter();

  const userId = session?.user?.id;

  const {
    data: feelLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['feel_logs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('feel_logs')
        .select('id, created_at, emotion, note')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
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
      <div className="flex flex-col gap-4">
        <div className="text-lg font-bold text-center mb-2">환영합니다! 😊</div>
        <Card className="rounded-2xl bg-pink-50/60">
          <CardContent className="py-4 text-center">
            <div className="mb-2">{session?.user?.email} 님, 오늘의 감정을 기록해보세요!</div>
            <Button
              className="ml-2 bg-blue-400 hover:bg-blue-500 text-white rounded-xl"
              size="sm"
              onClick={() => router.push('/insights')}
            >
              내 마음보기
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-blue-50/60">
          <CardContent className="py-4">
            <div className="font-semibold mb-2">최근 감정 기록</div>
            {!feelLogs || feelLogs.length === 0 ? (
              <EmptyWidget message="최근 감정 기록이 없습니다." />
            ) : (
              <ul className="space-y-2">
                {feelLogs.map((log: unknown) => (
                  <li key={log.id} className="flex flex-col text-sm bg-white/60 rounded-xl p-2">
                    <span className="font-bold text-pink-500">{log.emotion}</span>
                    <span className="text-gray-500">{log.note}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppWidgetLayout>
  );
}
