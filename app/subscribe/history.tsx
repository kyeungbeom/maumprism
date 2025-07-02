'use client';
import React, { useEffect, useState } from 'react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  created: number;
  payment_method: string;
  status: string;
  receipt_url?: string;
  description?: string;
}

const STATUS_LABELS: Record<string, string> = {
  succeeded: '성공',
  processing: '처리중',
  requires_payment_method: '결제수단 필요',
  canceled: '취소됨',
};

export default function SubscribeHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modal, setModal] = useState<Payment | null>(null);
  const [sortBy, setSortBy] = useState<'created' | 'amount' | 'status'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch('/api/stripe/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setPayments(data.payments || []);
          setFiltered(data.payments || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('불러오기 실패');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let f = payments;
    if (status) f = f.filter((p) => p.status === status);
    if (dateFrom) f = f.filter((p) => p.created * 1000 >= new Date(dateFrom).getTime());
    if (dateTo) f = f.filter((p) => p.created * 1000 <= new Date(dateTo).getTime() + 86400000 - 1);
    // 정렬
    f = [...f].sort((a, b) => {
      if (sortBy === 'created')
        return sortDir === 'asc' ? a.created - b.created : b.created - a.created;
      if (sortBy === 'amount') return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      if (sortBy === 'status')
        return sortDir === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      return 0;
    });
    setFiltered(f);
  }, [status, dateFrom, dateTo, payments, sortBy, sortDir]);

  const handleExportCSV = () => {
    const headers = ['결제일자', '금액', '결제수단', '상태', '영수증', '설명'];
    const rows = filtered.map((p) => [
      new Date(p.created * 1000).toLocaleString(),
      (p.amount / 100).toLocaleString(),
      p.payment_method,
      STATUS_LABELS[p.status] || p.status,
      p.receipt_url || '',
      p.description || '',
    ]);
    let csv = headers.join(',') + '\n';
    csv += rows
      .map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">결제 내역</h1>
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">상태</label>
          <select
            className="border rounded px-2 py-1"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">전체</option>
            <option value="succeeded">성공</option>
            <option value="processing">처리중</option>
            <option value="requires_payment_method">결제수단 필요</option>
            <option value="canceled">취소됨</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">시작일</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">종료일</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="ml-auto bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
        >
          CSV 내보내기
        </button>
      </div>
      {loading ? (
        <div className="text-center">로딩중...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500">결제 내역이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="px-3 py-2 border cursor-pointer"
                  onClick={() => setSortBy('created')}
                >
                  결제 일자 {sortBy === 'created' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-3 py-2 border cursor-pointer" onClick={() => setSortBy('amount')}>
                  금액 {sortBy === 'amount' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-3 py-2 border cursor-pointer" onClick={() => setSortBy('status')}>
                  상태 {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-3 py-2 border">결제 수단</th>
                <th className="px-3 py-2 border">영수증</th>
                <th className="px-3 py-2 border">상세</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-3 py-2 border">
                    {new Date(p.created * 1000).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border">₩{(p.amount / 100).toLocaleString()}</td>
                  <td className="px-3 py-2 border">{STATUS_LABELS[p.status] || p.status}</td>
                  <td className="px-3 py-2 border">{p.payment_method}</td>
                  <td className="px-3 py-2 border text-center">
                    {p.receipt_url ? (
                      <a
                        href={p.receipt_url}
                        target="_blank"
                        rel="noopener"
                        className="text-blue-600 hover:underline"
                      >
                        다운로드
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => setModal(p)}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="px-3 py-2 border text-right">합계</td>
                <td className="px-3 py-2 border">₩{(totalAmount / 100).toLocaleString()}</td>
                <td className="px-3 py-2 border" colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-black"
              onClick={() => setModal(null)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">결제 상세</h2>
            <div className="mb-2 text-sm text-gray-700">ID: {modal.id}</div>
            <div className="mb-2 text-sm text-gray-700">
              일시: {new Date(modal.created * 1000).toLocaleString()}
            </div>
            <div className="mb-2 text-sm text-gray-700">
              금액: ₩{(modal.amount / 100).toLocaleString()}
            </div>
            <div className="mb-2 text-sm text-gray-700">결제 수단: {modal.payment_method}</div>
            <div className="mb-2 text-sm text-gray-700">
              상태: {STATUS_LABELS[modal.status] || modal.status}
            </div>
            {modal.receipt_url && (
              <div className="mb-2 text-sm">
                <a
                  href={modal.receipt_url}
                  target="_blank"
                  rel="noopener"
                  className="text-blue-600 hover:underline"
                >
                  영수증 다운로드
                </a>
              </div>
            )}
            {modal.description && (
              <div className="mb-2 text-sm text-gray-700">설명: {modal.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
