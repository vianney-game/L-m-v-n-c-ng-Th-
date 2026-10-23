import React from 'react';

interface SparkleProps {
  active: boolean;
  type?: 'basket' | 'victory';
  x?: number;
  y?: number;
}

export const SparkleEffect: React.FC<SparkleProps> = ({ active, type = 'basket', x, y }) => {
  if (!active) return null;

  if (type === 'victory') {
    // Full screen celebration stars
    const stars = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 3.6 + Math.random() * 3) % 96 + 2}%`,
      delay: `${(i * 0.12).toFixed(2)}s`,
      duration: `${1.8 + (i % 5) * 0.3}s`,
      size: 16 + (i % 4) * 8,
      color: ['#FBBF24', '#F472B6', '#34D399', '#60A5FA', '#A78BFA', '#F59E0B'][i % 6],
    }));

    return (
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute animate-bounce"
            style={{
              left: s.left,
              top: `${Math.random() * 60 + 10}%`,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          >
            <svg
              width={s.size}
              height={s.size}
              viewBox="0 0 24 24"
              fill={s.color}
              className="drop-shadow-lg filter"
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </div>
        ))}
      </div>
    );
  }

  // Local basket sparkle
  const localStars = [
    { top: '-20px', left: '20px', delay: '0s', size: 22, color: '#FBBF24' },
    { top: '-15px', right: '30px', delay: '0.2s', size: 18, color: '#34D399' },
    { top: '40px', left: '-15px', delay: '0.4s', size: 20, color: '#F472B6' },
    { top: '60px', right: '-15px', delay: '0.1s', size: 24, color: '#FBBF24' },
    { bottom: '-10px', left: '40px', delay: '0.3s', size: 16, color: '#60A5FA' },
  ];

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={x !== undefined && y !== undefined ? { left: x, top: y } : { inset: 0 }}
    >
      {localStars.map((s, idx) => (
        <div
          key={idx}
          className="absolute animate-ping"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            animationDelay: s.delay,
            animationDuration: '1.2s',
          }}
        >
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 24 24"
            fill={s.color}
            className="drop-shadow-md"
          >
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </div>
      ))}
    </div>
  );
};
