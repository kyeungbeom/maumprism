import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import AppWidgetLayout from '../../components/AppWidgetLayout';
import ClientOnlyReport from './ClientOnlyReport';

export default async function ReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data } = await supabase.from('reports').select('*');

  if (!data) notFound();

  return (
    <AppWidgetLayout>
      <ClientOnlyReport reports={data} />
    </AppWidgetLayout>
  );
}
