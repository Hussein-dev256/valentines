import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
}

export default function RainingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Generate 25 hearts with randomized properties for continuous rain
    const generatedHearts: Heart[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 30 + 20, // 20-50px
      duration: Math.random() * 8 + 10, // 10-18s
      delay: Math.random() * 15, // 0-15s stagger for continuous effect
    }));

    setHearts(generatedHearts);
  }, []);

  return (
    <div className="hearts-rain-container">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart-rain"
          style={{
            left: heart.left,
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`heartGradient-${heart.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ff4d7d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ff1744" stopOpacity="0.8" />
              </linearGradient>
              <filter id={`glassBlur-${heart.id}`}>
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
              </filter>
            </defs>
            
            {/* Main heart shape with liquid glass effect */}
            <path
              d="M50 85 C20 60, 10 40, 10 28 C10 15, 20 8, 30 8 C40 8, 45 15, 50 22 C55 15, 60 8, 70 8 C80 8, 90 15, 90 28 C90 40, 80 60, 50 85 Z"
              fill={`url(#heartGradient-${heart.id})`}
              filter={`url(#glassBlur-${heart.id})`}
            />
            
            {/* Glossy highlight */}
            <ellipse
              cx="50"
              cy="25"
              rx="20"
              ry="12"
              fill="rgba(255, 255, 255, 0.4)"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

