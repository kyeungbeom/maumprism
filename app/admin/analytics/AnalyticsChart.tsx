'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const BarChartDynamic = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const BarDynamic = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxisDynamic = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxisDynamic = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const TooltipDynamic = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainerDynamic = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false },
);

interface AnalyticsChartProps {
  byType: Record<string, { click: number; react: number; count: number }>;
  byHour: Record<string, number>;
  byUserType: Record<string, number>;
}

export default function AnalyticsChart({ byType, byHour, byUserType }: AnalyticsChartProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 유형별 클릭률/반응률 */}
      <div className="bg-white rounded shadow p-4 border border-gray-100">
        <div className="font-semibold mb-2">유형별 클릭률/반응률</div>
        <ResponsiveContainerDynamic width="100%" height={240}>
          <BarChartDynamic
            data={Object.entries(byType).map(([type, v]) => ({
              type,
              클릭률: v.click,
              반응률: v.react,
            }))}
          >
            <XAxisDynamic dataKey="type" />
            <YAxisDynamic />
            <TooltipDynamic />
            <BarDynamic dataKey="클릭률" fill="#60a5fa" />
            <BarDynamic dataKey="반응률" fill="#fbbf24" />
          </BarChartDynamic>
        </ResponsiveContainerDynamic>
      </div>
      {/* 시간대 분포 */}
      <div className="bg-white rounded shadow p-4 border border-gray-100">
        <div className="font-semibold mb-2">알림 시간대 분포</div>
        <ResponsiveContainerDynamic width="100%" height={240}>
          <BarChartDynamic
            data={Object.entries(byHour).map(([hour, v]) => ({
              hour,
              count: v,
            }))}
          >
            <XAxisDynamic dataKey="hour" />
            <YAxisDynamic />
            <TooltipDynamic />
            <BarDynamic dataKey="count" fill="#34d399" />
          </BarChartDynamic>
        </ResponsiveContainerDynamic>
      </div>
      {/* 유저 유형별 반응 경향 */}
      <div className="bg-white rounded shadow p-4 border border-gray-100 col-span-1 md:col-span-2">
        <div className="font-semibold mb-2">유저 유형별 반응 경향</div>
        <ResponsiveContainerDynamic width="100%" height={240}>
          <BarChartDynamic
            data={Object.entries(byUserType).map(([ut, v]) => ({
              userType: ut,
              count: v,
            }))}
          >
            <XAxisDynamic dataKey="userType" />
            <YAxisDynamic />
            <TooltipDynamic />
            <BarDynamic dataKey="count" fill="#818cf8" />
          </BarChartDynamic>
        </ResponsiveContainerDynamic>
      </div>
    </div>
  );
}
