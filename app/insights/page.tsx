'use client';
import AppWidgetLayout from '../components/AppWidgetLayout';
import { Card, CardContent } from '@/components/ui/card';
import LoadingWidget from '../components/LoadingWidget';
import EmptyWidget from '../components/EmptyWidget';
import React, { useState, useEffect } from 'react';
import { useProtectedPage } from '../hooks/useProtectedPage';
import { supabase } from '../lib/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Insight {
  message?: string;
  emotion?: string;
}

interface ChartDatum {
  emotion: string;
  count: number;
}

export default function InsightsPage() {
  useProtectedPage();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const [pieData, setPieData] = useState<ChartDatum[]>([]);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      const { data, error } = await supabase.from('daily_insights').select('*');
      if (!error && data) {
        setInsights(data as Insight[]);
        // 예시: 감정별 count 집계
        const emotionCount: Record<string, number> = {};
        (data as Insight[]).forEach((item) => {
          if (item.emotion) {
            emotionCount[item.emotion] = (emotionCount[item.emotion] || 0) + 1;
          }
        });
        const bar = Object.entries(emotionCount).map(([emotion, count]) => ({
          emotion,
          count,
        }));
        setChartData(bar as ChartDatum[]);
        setPieData(bar as ChartDatum[]);
      }
      setLoading(false);
    }
    fetchInsights();
  }, []);

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
            <div className="font-semibold mb-2">감정 주기 분석</div>
            {chartData.length === 0 ? (
              <EmptyWidget message="분석 데이터가 없습니다." />
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <ResponsiveContainer width={300} height={200}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="감정 횟수" />
                  </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="count"
                      nameKey="emotion"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#82ca9d"
                      label
                    >
                      {pieData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a3e635'][idx % 5]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-blue-50/60">
          <CardContent className="py-4 text-center">
            <div className="font-semibold mb-2">AI 추천 메시지</div>
            {insights.length === 0 ? (
              <EmptyWidget message="추천 메시지가 없습니다." />
            ) : (
              <ul>
                {insights.map((msg, i) => (
                  <li key={i}>{msg.message || msg.emotion}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppWidgetLayout>
  );
}
