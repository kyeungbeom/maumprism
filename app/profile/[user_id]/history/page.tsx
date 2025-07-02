'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { HistoryLog } from '@/utils/types';
import { HistoryCard } from '@/components/HistoryCard';

const ACTIONS = [
  '',
  'POST_CREATE',
  'COMMENT_CREATE',
  'GROUP_JOIN',
  'NOTIFICATION_READ',
  'LEVEL_UP',
  'ACHIEVEMENT',
];

export default function HistoryPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { user_id } = useParams();
  const [mode, setMode] = useState<'summary' | 'detail'>('summary');
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState(search.get('action') || '');
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalLog, setModalLog] = useState<HistoryLog | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'action' | 'user_id'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [visibleCols, setVisibleCols] = useState<{ [k: string]: boolean }>({
    id: false,
    user_id: true,
    action: true,
    target_type: true,
    target_id: false,
    created_at: true,
  });
  const [undoLog, setUndoLog] = useState<HistoryLog | null>(null);

  // 관리자 권한 확인 (예: /api/me에서 role 확인)
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const { role } = await res.json();
        setIsAdmin(role === 'admin');
      } catch {}
    }
    checkAdmin();
  }, []);

  // 서버에서 데이터 fetch (필터 추가)
  const fetchLogs = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('offset', offset.toString());
      if (actionFilter) params.set('action', actionFilter);
      if (isAdmin && userIdFilter) params.set('user_id', userIdFilter);
      if (isAdmin && dateFrom) params.set('from', dateFrom);
      if (isAdmin && dateTo) params.set('to', dateTo);
      if (isAdmin && searchKeyword) params.set('search', searchKeyword);
      params.set('sortBy', sortBy);
      params.set('sortDir', sortDir);
      const res = await fetch(`/api/history/${user_id}?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) setError('로그인이 필요합니다.');
        else if (res.status === 403) setError('본인만 볼 수 있습니다.');
        else setError('불러오기 오류');
        setHasMore(false);
        setLoading(false);
        return;
      }
      const { data } = await res.json();
      setLogs((prev) => [...prev, ...data]);
      setHasMore(data.length === 50);
      setOffset((prev) => prev + data.length);
    } catch {
      setError('불러오기 오류');
      setHasMore(false);
    }
    setLoading(false);
  }, [
    user_id,
    offset,
    actionFilter,
    hasMore,
    loading,
    isAdmin,
    userIdFilter,
    dateFrom,
    dateTo,
    searchKeyword,
    sortBy,
    sortDir,
  ]);

  // 필터 변경 시 초기화
  useEffect(() => {
    setLogs([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [actionFilter, user_id]);

  // 필터 변경 시 첫 페이지 fetch
  useEffect(() => {
    if (offset === 0 && hasMore) fetchLogs();
    // eslint-disable-next-line
  }, [actionFilter, user_id]);

  // Intersection Observer로 무한스크롤
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchLogs();
      },
      { threshold: 1 },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchLogs, hasMore, loading]);

  // 로그 삭제
  const handleDelete = async (logId: string) => {
    const log = logs.find((l) => l.id === logId);
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/history/${user_id}?id=${logId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      if (log) setUndoLog(log);
      // 삭제 액션 로그 남기기
      await fetch('/api/admin/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', log }),
      });
    } else {
      alert('삭제 실패');
    }
  };

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (!window.confirm('현재 필터 조건에 맞는 모든 로그를 삭제하시겠습니까?')) return;
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (userIdFilter) params.set('user_id', userIdFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    const res = await fetch(`/api/history/${user_id}/bulk-delete?${params.toString()}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setLogs([]);
      setOffset(0);
      setHasMore(false);
      alert('일괄 삭제 완료');
    } else {
      alert('일괄 삭제 실패');
    }
  };

  // 엑셀(CSV) 내보내기
  const handleExportCSV = () => {
    const headers = ['id', 'user_id', 'action', 'target_type', 'target_id', 'created_at'];
    const rows = logs.map((l) => headers.map((h) => (l as any)[h]));
    let csv = headers.join(',') + '\n';
    csv += rows
      .map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'history_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 일괄 선택/해제
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const selectAll = () => setSelectedIds(logs.map((l) => l.id));
  const clearSelect = () => setSelectedIds([]);

  // 선택된 로그 일괄 삭제
  const handleBulkSelectedDelete = async () => {
    if (!window.confirm('선택된 로그를 모두 삭제하시겠습니까?')) return;
    const deletedLogs = logs.filter((l) => selectedIds.includes(l.id));
    for (const id of selectedIds) {
      await fetch(`/api/history/${user_id}?id=${id}`, { method: 'DELETE' });
    }
    setLogs((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
    setSelectedIds([]);
    if (deletedLogs.length) setUndoLog(deletedLogs[0]);
    // 삭제 액션 로그 남기기
    await fetch('/api/admin/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk_delete', logs: deletedLogs }),
    });
  };

  // 컬럼 토글
  const toggleCol = (col: string) => setVisibleCols((v) => ({ ...v, [col]: !v[col] }));

  // 로그 복구(undo)
  const handleUndo = async () => {
    if (!undoLog) return;
    // 복구 API 호출(예: /api/history/[user_id]/restore)
    const res = await fetch(`/api/history/${user_id}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log: undoLog }),
    });
    if (res.ok) {
      setLogs((prev) => [undoLog!, ...prev]);
      setUndoLog(null);
      alert('복구 완료');
    } else {
      alert('복구 실패');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        {/* 액션 필터 드롭다운 */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">전체</option>
          {ACTIONS.filter((a) => a).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          onClick={() => setMode((prev) => (prev === 'summary' ? 'detail' : 'summary'))}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          {mode === 'summary' ? '자세히 보기' : '요약 보기'}
        </button>
        {isAdmin && (
          <>
            <input
              type="text"
              placeholder="유저ID 필터"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="border rounded px-2 py-1 ml-2"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded px-2 py-1 ml-2"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded px-2 py-1 ml-2"
            />
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-3 py-1 rounded ml-2 hover:bg-red-600"
            >
              일괄 삭제
            </button>
          </>
        )}
      </div>
      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-2 items-center">
          <input
            type="text"
            placeholder="키워드 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={handleExportCSV}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            엑셀 내보내기
          </button>
          <button onClick={selectAll} className="bg-gray-300 px-2 py-1 rounded">
            전체선택
          </button>
          <button onClick={clearSelect} className="bg-gray-300 px-2 py-1 rounded">
            선택해제
          </button>
          <button
            onClick={handleBulkSelectedDelete}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            선택삭제
          </button>
          {/* 정렬 */}
          <label>
            정렬:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded px-2 py-1 ml-1"
            >
              <option value="created_at">날짜</option>
              <option value="action">액션</option>
              <option value="user_id">유저ID</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="border rounded px-2 py-1 ml-1"
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>
          </label>
          {/* 컬럼 토글 */}
          <label className="ml-2">
            컬럼:
            {Object.keys(visibleCols).map((col) => (
              <span key={col} className="ml-1">
                <input type="checkbox" checked={visibleCols[col]} onChange={() => toggleCol(col)} />{' '}
                {col}
              </span>
            ))}
          </label>
        </div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="space-y-2">
        {logs.map((log, i) => (
          <div key={log.id || i} className="relative group">
            {isAdmin && (
              <input
                type="checkbox"
                checked={selectedIds.includes(log.id)}
                onChange={() => toggleSelect(log.id)}
                className="absolute left-2 top-2 z-10"
              />
            )}
            <div onClick={() => setModalLog(log)} className={isAdmin ? 'cursor-pointer pl-6' : ''}>
              <div className="flex gap-2">
                {Object.entries(visibleCols).map(
                  ([col, show]) =>
                    show && (
                      <span key={col} className="text-xs text-gray-700">
                        {String((log as any)[col])}
                      </span>
                    ),
                )}
              </div>
              <HistoryCard log={log} mode={mode} />
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDelete(log.id)}
                className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>
      <div ref={loaderRef} className="h-8 flex items-center justify-center">
        {loading && <span className="text-gray-400">불러오는 중...</span>}
        {!hasMore && !loading && <span className="text-gray-400">모두 불러왔어요.</span>}
      </div>
      {/* 상세 로그 모달 */}
      {modalLog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => setModalLog(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-2">상세 로그</h2>
            <pre className="text-xs bg-gray-100 rounded p-2 overflow-x-auto">
              {JSON.stringify(modalLog, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {/* 복구(undo) 버튼 */}
      {isAdmin && undoLog && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleUndo}
            className="bg-yellow-400 text-black px-4 py-2 rounded shadow-lg"
          >
            삭제 취소(복구)
          </button>
        </div>
      )}
    </div>
  );
}
