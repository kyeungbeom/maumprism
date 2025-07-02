import React from 'react';

interface Props {
  title: string;
  value: React.ReactNode;
}

const DashboardCard: React.FC<Props> = ({ title, value }) => (
  <div className="bg-white rounded shadow p-4 text-center">
    <div className="text-lg font-semibold mb-2">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default DashboardCard;
