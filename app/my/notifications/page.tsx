'use client';
import React, { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';
import { toast } from 'react-hot-toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  url?: string;
}

export default function NotificationsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((d) => setRole(d.role));
  }, []);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          toast.error(d.error);
        } else {
          setNotifications(d.notifications || []);
        }
      })
      .catch(() => {
        setError('알림 데이터 불러오기 실패');
        toast.error('알림 데이터 불러오기 실패');
      })
      .finally(() => setLoading(false));
  }, [role]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (role === null || loading) return <Spinner />;
  if (role === 'guest')
    return <div className="p-8 text-center text-red-500 font-bold">로그인 후 이용 가능합니다.</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 알림</h1>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded shadow p-4 flex items-center gap-4 ${n.read ? 'bg-gray-100' : 'bg-white border-l-4 border-blue-500'}`}
          >
            <div
              className="flex-1 cursor-pointer"
              onClick={() => {
                markAsRead(n.id);
                if (n.url) window.location.href = n.url;
              }}
            >
              <div className="font-bold">{n.title}</div>
              <div className="text-gray-500 text-sm">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
            {!n.read && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                NEW
              </span>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center text-gray-400 py-8">알림 없음</div>
        )}
      </div>
    </div>
  );
}
