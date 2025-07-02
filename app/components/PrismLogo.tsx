import Image from 'next/image';

export default function PrismLogo({
  size = 180,
  withText = false,
}: {
  size?: number;
  withText?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* 프리즘 빛 */}
        <svg
          className="absolute left-0 top-1/2 -translate-y-1/2 animate-pulse"
          width={size}
          height={size / 2}
          viewBox={`0 0 ${size} ${size / 2}`}
          fill="none"
        >
          <polygon
            points={`0,${size / 2} ${size},0 ${size},${size / 2}`}
            fill="url(#prism)"
            opacity="0.7"
          />
          <defs>
            <linearGradient
              id="prism"
              x1="0"
              y1="0"
              x2={size}
              y2={size / 2}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#AEC6CF" />
              <stop offset="0.5" stopColor="#77DD77" />
              <stop offset="1" stopColor="#FFD1DC" />
            </linearGradient>
          </defs>
        </svg>
        {/* 하트 */}
        <svg
          className="relative z-10 animate-heart"
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ filter: 'drop-shadow(0 4px 24px #FFAFBD66)' }}
        >
          <defs>
            <radialGradient id="heartGrad" cx="50%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#FFD1DC" />
              <stop offset="60%" stopColor="#FFAFBD" />
              <stop offset="100%" stopColor="#FFAFBD" />
            </radialGradient>
          </defs>
          <path
            d="M50 82C50 82 10 58 10 35C10 20 30 10 50 28C70 10 90 20 90 35C90 58 50 82 50 82Z"
            fill="url(#heartGrad)"
          />
        </svg>
      </div>
      {withText && (
        <div className="mt-4 text-center">
          <div
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-main)' }}
          >
            MAUM
            <br />
            PRISM
          </div>
          <div className="text-base mt-2 text-gray-500">
            당신의 마음, 프리즘처럼 빛나다 ✨<br />
            <span className="text-xs">마음의 모든 색깔을 담다</span>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-heart {
          animation: heartPop 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite
            alternate;
        }
        @keyframes heartPop {
          0% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          60% {
            transform: scale(1.06) translateY(-2px);
            opacity: 1;
          }
          100% {
            transform: scale(1.12) translateY(-4px);
            opacity: 0.96;
          }
        }
      `}</style>
    </div>
  );
}
