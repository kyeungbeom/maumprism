'use client';

type Report = {
  id: string;
  report_type: string;
  content: {
    title: string;
    description?: string;
  };
  created_at: string;
};

interface Props {
  reports: Report[];
}

export default function ClientOnlyReport({ reports }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reports</h2>
      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className="p-2 bg-gray-100 rounded">
            {r.content.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
