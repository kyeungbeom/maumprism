'use client';
import AppWidgetLayout from '../../components/AppWidgetLayout';
import { Card, CardContent } from '@/components/ui/card';
import LoadingWidget from '../../components/LoadingWidget';
import EmptyWidget from '../../components/EmptyWidget';
import React from 'react';

interface ReportsClientProps {
  stats: unknown;
  trends: unknown[];
  loading: boolean;
}

export default function ReportsClient({ stats, trends, loading }: ReportsClientProps) {
  if (loading)
    return (
      <AppWidgetLayout>
        <LoadingWidget />
      </AppWidgetLayout>
    );

  return (
    <AppWidgetLayout>
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl bg-pink-50/60">
          <CardContent className="py-4 text-center">
            <div className="font-semibold mb-2">유저/매출 통계</div>
            {stats ? (
              <div>{/* TODO: 통계 데이터 표시 */}</div>
            ) : (
              <EmptyWidget message="통계 데이터가 없습니다." />
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-blue-50/60">
          <CardContent className="py-4 text-center">
            <div className="font-semibold mb-2">요일별 트렌드 분석</div>
            {trends.length === 0 ? (
              <EmptyWidget message="트렌드 데이터가 없습니다." />
            ) : (
              <ul>
                {trends.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppWidgetLayout>
  );
}
