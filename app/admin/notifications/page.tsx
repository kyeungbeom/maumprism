import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getNotifications({
  from,
  to,
  type,
  status,
  page,
  pageSize,
}: {
  from?: string;
  to?: string;
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createServerComponentClient({ cookies });
  let query = supabase.from('users_notifications').select('*', { count: 'exact' });
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (type && type !== 'all') query = query.eq('type', type);
  if (status && status !== 'all') query = query.eq('status', status); // status 컬럼이 있다면
  const pageNum = page || 1;
  const size = pageSize || 20;
  query = query
    .order('created_at', { ascending: false })
    .range((pageNum - 1) * size, pageNum * size - 1);
  const { data, count } = await query;
  return { data: data || [], count: count || 0 };
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  // 관리자 인증 (user.role === 'admin')
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.role !== 'admin') return notFound();

  // 필터 파라미터
  const { from, to, type = 'all', status = 'all', page = '1' } = searchParams || {};
  const pageNum = parseInt(page, 10) || 1;
  const pageSize = 20;
  const { data: notifications, count } = await getNotifications({
    from,
    to,
    type,
    status,
    page: pageNum,
    pageSize,
  });
  const totalPages = Math.ceil(count / pageSize);

  // 고유 type/status 목록 (간단 샘플)
  const types = ['all', 'care', 'system', 'promo'];
  const statuses = ['all', 'unread', 'read']; // status 컬럼이 없다면 제거

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">알림 전송 이력</h1>
      <form className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-xs text-gray-500">시작일</label>
          <input
            type="date"
            name="from"
            defaultValue={from?.slice(0, 10)}
            className="border rounded px-2 py-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">종료일</label>
          <input
            type="date"
            name="to"
            defaultValue={to?.slice(0, 10)}
            className="border rounded px-2 py-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">유형</label>
          <select name="type" defaultValue={type} className="border rounded px-2 py-1 text-xs">
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500">상태</label>
          <select name="status" defaultValue={status} className="border rounded px-2 py-1 text-xs">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white rounded px-3 py-1 text-xs">
          검색
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">유저</th>
              <th className="p-2 border">유형</th>
              <th className="p-2 border">상태</th>
              <th className="p-2 border">메시지</th>
              <th className="p-2 border">일시</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border break-all">{n.id}</td>
                <td className="p-2 border break-all">{n.user_id}</td>
                <td className="p-2 border">{n.type}</td>
                <td className="p-2 border">{n.status || '-'}</td>
                <td className="p-2 border break-all max-w-xs">{n.message}</td>
                <td className="p-2 border">{formatDate(n.created_at)}</td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  데이터 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 text-xs">
        <div>총 {count}건</div>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i + 1}
              href={{
                pathname: '/admin/notifications',
                query: { ...searchParams, page: i + 1 },
              }}
              className={`px-2 py-1 rounded ${pageNum === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
