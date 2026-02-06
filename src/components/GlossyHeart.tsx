export default function GlossyHeart() {
  return (
    <span className="glossy-heart">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="50%" stopColor="#ff8fab" />
            <stop offset="100%" stopColor="#ffa3ba" />
          </linearGradient>
          <linearGradient id="heartShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="30%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
          <filter id="gloss">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Main heart shape */}
        <path
          d="M50 85 C20 60, 10 40, 10 28 C10 15, 20 8, 30 8 C40 8, 45 15, 50 22 C55 15, 60 8, 70 8 C80 8, 90 15, 90 28 C90 40, 80 60, 50 85 Z"
          fill="url(#heartGradient)"
          filter="url(#gloss)"
        />
        
        {/* Glossy highlight */}
        <ellipse
          cx="50"
          cy="30"
          rx="25"
          ry="15"
          fill="url(#heartShine)"
          opacity="0.7"
        />
        
        {/* Vertical stripes for depth */}
        <g opacity="0.15">
          <rect x="30" y="15" width="3" height="50" fill="#ff6b9d" rx="1.5" />
          <rect x="40" y="15" width="3" height="55" fill="#ff6b9d" rx="1.5" />
          <rect x="50" y="15" width="3" height="60" fill="#ff6b9d" rx="1.5" />
          <rect x="60" y="15" width="3" height="55" fill="#ff6b9d" rx="1.5" />
          <rect x="70" y="15" width="3" height="50" fill="#ff6b9d" rx="1.5" />
        </g>
      </svg>
    </span>
  );
}
