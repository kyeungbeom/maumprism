import React, { useState } from 'react';

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedEmotion) return;
    setLoading(true);
    setError(null);
    const emotionObj = emotions.find((e) => e.emoji === selectedEmotion);
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion: emotionObj?.label, note }),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || '오류가 발생했습니다.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="mb-4 text-2xl font-bold">감정을 기록했어요!</h1>
        <p className="text-lg">오늘의 감정: {selectedEmotion}</p>
        <button
          className="px-4 py-2 mt-8 bg-yellow-400 rounded"
          onClick={() => setSubmitted(false)}
        >
          다시 입력
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center p-4 min-h-screen">
      <h1 className="mb-6 text-2xl font-bold">오늘의 감정은 어떤가요?</h1>
      <div className="flex mb-6 space-x-4">
        {emotions.map(({ emoji, label }) => (
          <button
            key={label}
            className={`text-3xl ${selectedEmotion === emoji ? 'scale-125' : ''}`}
            onClick={() => setSelectedEmotion(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <textarea
        className="p-2 mb-4 w-full max-w-xs rounded border"
        rows={2}
        placeholder="간단한 메모 (선택)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <div className="mb-2 text-sm text-red-500">{error}</div>}
      <button
        className="px-4 py-2 w-full max-w-xs text-white bg-yellow-400 rounded disabled:opacity-50"
        disabled={!selectedEmotion || loading}
        onClick={handleSubmit}
      >
        {loading ? '기록 중...' : '기록하기'}
      </button>
      <div className="mb-4 text-5xl">{selectedEmotion}</div>
    </div>
  );
}
