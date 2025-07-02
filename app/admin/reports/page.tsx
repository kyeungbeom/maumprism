import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import ClientReportView from './ClientReportView';

export default function ReportsPage() {
  const cookieStore = cookies();
  // 서버에서 데이터 fetch 및 로직 처리 가능
  return (
    <div>
      <ClientReportView />
    </div>
  );
}
