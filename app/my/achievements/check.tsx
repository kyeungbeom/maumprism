import Spinner from '@/components/Spinner';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function AchievementCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/my/achievements/check', { method: 'POST' });
      if (!res.ok) throw new Error('실패');
      toast.success('성공적으로 처리되었습니다!');
    } catch (e) {
      setError('처리 실패!');
      toast.error('처리 실패!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAction}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? '처리 중...' : '업적 체크'}
      </button>
      {loading && <Spinner />}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
