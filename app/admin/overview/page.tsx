import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const supabase = createServerComponentClient({ cookies });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 오늘 알림 발송 수
  const { count: sentToday } = await supabase
    .from('users_notifications')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayISO);

  // 미발송/실패율 (scheduled_notifications 중 is_sent=false)
  const { count: pending } = await supabase
    .from('scheduled_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_sent', false);
  const { count: totalScheduled } = await supabase
    .from('scheduled_notifications')
    .select('id', { count: 'exact', head: true });
  const failRate =
    totalScheduled && totalScheduled > 0 ? Math.round(((pending || 0) / totalScheduled) * 100) : 0;

  // 최근 7일 활성 사용자 수 (users_notifications 기준)
  const { data: activeUsers } = await supabase
    .from('users_notifications')
    .select('user_id')
    .gte('created_at', weekAgo);
  const uniqueActiveUsers = Array.from(new Set((activeUsers || []).map((u) => u.user_id))).length;

  // Pro 유저 비율 (profiles 테이블에 subscription=pro)
  const { count: proCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('subscription', 'pro');
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });
  const proRate =
    totalUsers && totalUsers > 0 ? Math.round(((proCount || 0) / totalUsers) * 100) : 0;

  return {
    sentToday: sentToday || 0,
    failRate,
    uniqueActiveUsers,
    proRate,
  };
}

export default async function AdminOverviewPage() {
  // 관리자 인증 (user.role === 'admin')
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') return notFound();

  const stats = await getDashboardStats();

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">관리자 메타 대시보드</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="text-gray-500 text-xs mb-1">오늘 알림 발송 수</div>
            <div className="text-3xl font-bold">{stats.sentToday}</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="text-gray-500 text-xs mb-1">미발송/실패율</div>
            <div className="text-3xl font-bold">{stats.failRate}%</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="text-gray-500 text-xs mb-1">최근 7일 활성 사용자 수</div>
            <div className="text-3xl font-bold">{stats.uniqueActiveUsers}</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="text-gray-500 text-xs mb-1">Pro 유저 비율</div>
            <div className="text-3xl font-bold">{stats.proRate}%</div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
