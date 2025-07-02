import React, { useEffect, useRef } from 'react';

interface Achievement {
  icon: string;
  name: string;
  description: string;
  achieved_at?: string;
  badge_type?: string;
}

export default function AchievementModal({
  achievement,
  open,
  onClose,
  onSetTitle,
}: {
  achievement: Achievement;
  open: boolean;
  onClose: () => void;
  onSetTitle?: () => void;
}) {
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open && achievement) {
      // 간단한 confetti 애니메이션 (캔버스)
      const canvas = confettiRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let running = true;
      const colors = ['#fbbf24', '#60a5fa', '#34d399', '#f472b6', '#f87171'];
      const confetti = Array.from({ length: 40 }, () => ({
        x: Math.random() * 300,
        y: Math.random() * -200,
        r: 6 + Math.random() * 8,
        c: colors[Math.floor(Math.random() * colors.length)],
        v: 2 + Math.random() * 3,
      }));
      function draw() {
        if (ctx) {
          ctx.clearRect(0, 0, 300, 200);
        }
        confetti.forEach((f) => {
          if (ctx) {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, 2 * Math.PI);
            ctx.fillStyle = f.c;
            ctx.fill();
          }
          f.y += f.v;
          if (f.y > 200) f.y = Math.random() * -50;
        });
        if (running) requestAnimationFrame(draw);
      }
      draw();
      return () => {
        running = false;
      };
    }
  }, [open, achievement]);

  if (!open || !achievement) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center relative">
        <canvas
          ref={confettiRef}
          width={300}
          height={200}
          className="absolute left-0 top-0 pointer-events-none"
          style={{ zIndex: 1 }}
        />
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-10"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="text-5xl mb-4 relative z-10">{achievement.icon}</div>
        <div className="text-xl font-bold mb-2 relative z-10">{achievement.name}</div>
        <div className="text-gray-500 mb-4 relative z-10">{achievement.description}</div>
        {achievement.achieved_at && (
          <div className="text-xs text-green-600 relative z-10">
            획득일: {new Date(achievement.achieved_at).toLocaleDateString()}
          </div>
        )}
        {achievement.badge_type === '칭호' && achievement.achieved_at && onSetTitle && (
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow relative z-10"
            onClick={onSetTitle}
          >
            대표 칭호로 설정
          </button>
        )}
      </div>
    </div>
  );
}
