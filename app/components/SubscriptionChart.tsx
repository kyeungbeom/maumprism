import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from 'recharts';

interface Stat {
  month: string;
  count: number;
  revenue: number;
}

const SubscriptionChart: React.FC<{ data: Stat[] }> = ({ data }) => (
  <div className="bg-white rounded shadow p-4">
    <div className="text-lg font-semibold mb-4">월별 구독 통계</div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="구독자 수" />
        <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="매출" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default SubscriptionChart;
