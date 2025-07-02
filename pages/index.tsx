import { useState } from 'react';

const emotions = [
  { emoji: '😊', label: '행복' },
  { emoji: '😢', label: '슬픔' },
  { emoji: '😡', label: '분노' },
  { emoji: '😐', label: '무감정' },
  { emoji: '🤩', label: '신남' },
];

export default function Home() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedEmotion) {
      setError('감정을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: selectedEmotion, note }),
      });

      if (!res.ok) throw new Error('저장 실패');

      setSubmitted(true);
    } catch {
      setError('저장 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedEmotion(null);
    setNote('');
    setSubmitted(false);
    setError('');
  };

  return (
    <main className="flex flex-col justify-center items-center p-4 min-h-screen bg-gray-50">
      {!submitted ? (
        <>
          <h1 className="mb-4 text-2xl font-bold">오늘의 감정은?</h1>
          <div className="flex mb-4 space-x-3">
            {emotions.map(({ emoji, label }) => (
              <button
                key={label}
                className={`text-3xl transition-transform ${
                  selectedEmotion === emoji ? 'scale-125' : ''
                }`}
                onClick={() => setSelectedEmotion(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <textarea
            className="p-2 mb-4 w-full max-w-md rounded border"
            rows={3}
            placeholder="메모를 남겨보세요 (선택 사항)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!selectedEmotion || loading}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '기록 중...' : '기록하기'}
          </button>
        </>
      ) : (
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">감정을 기록했어요!</h2>
          <div className="mb-4 text-5xl">{selectedEmotion}</div>
          <button onClick={reset} className="text-blue-500 underline">
            다시 입력
          </button>
        </div>
      )}
    </main>
  );
}
