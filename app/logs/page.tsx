'use client';
import { useState } from 'react';

const emotions = [
  { emoji: '😊', label: '행복' },
  { emoji: '😢', label: '슬픔' },
  { emoji: '😡', label: '분노' },
  { emoji: '😐', label: '무감정' },
  { emoji: '🤩', label: '신남' },
];

export default function LogsPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedEmotion) return;
    setError(null);
    setLoading(true);
    const emotionObj = emotions.find((e) => e.emoji === selectedEmotion);
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion: emotionObj?.label, note }),
    });
    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || '오류가 발생했습니다.');
    }
  };

  const reset = () => {
    setSelectedEmotion(null);
    setNote('');
    setSubmitted(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      {!submitted ? (
        <>
          <h1 className="text-2xl font-bold mb-4">오늘의 감정은?</h1>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {emotions.map(({ emoji, label }) => (
              <button
                key={label}
                className={`text-3xl w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all duration-150
                  ${selectedEmotion === emoji ? 'border-blue-500 bg-blue-100 scale-110 shadow-lg' : 'border-gray-200 bg-white'}
                  hover:scale-110 focus:outline-none`}
                onClick={() => setSelectedEmotion(emoji)}
                aria-label={label}
                disabled={loading}
              >
                {emoji}
              </button>
            ))}
          </div>
          <textarea
            className="w-full max-w-md p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-300 transition-all text-base sm:text-lg"
            rows={3}
            placeholder="메모를 남겨보세요 (선택 사항)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
          />
          {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
          <button
            onClick={handleSubmit}
            className="w-full max-w-md bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-base sm:text-lg"
            disabled={!selectedEmotion || loading}
          >
            {loading ? '기록 중...' : '기록하기'}
          </button>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">감정을 기록했어요!</h2>
          <div className="text-5xl mb-4">{selectedEmotion}</div>
          <button onClick={reset} className="text-blue-500 underline">
            다시 입력
          </button>
        </div>
      )}
    </main>
  );
}
