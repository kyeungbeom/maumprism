import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminReportDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') return notFound();

  const { data: report } = await supabase
    .from('admin_reports')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!report) return notFound();

  let content: Record<string, unknown> = {};
  try {
    content = typeof report.content === 'string' ? JSON.parse(report.content) : report.content;
  } catch {}

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">리포트 상세</h1>
      <div className="mb-2 text-gray-500 text-xs">ID: {report.id}</div>
      <div className="mb-2 text-gray-500 text-xs">
        생성일: {new Date(report.created_at).toLocaleString()}
      </div>
      <div className="bg-white rounded shadow p-4 border border-gray-100">
        <div className="font-semibold mb-2">내용</div>
        <pre className="bg-gray-50 rounded p-2 text-xs whitespace-pre-wrap break-all overflow-x-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}
