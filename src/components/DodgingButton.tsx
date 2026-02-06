import { useState, useEffect, useRef, type ReactNode } from 'react';

interface DodgingButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  dodgeDuration?: number;
  dodgeRadius?: number; // For test compatibility
}

export default function DodgingButton({
  children,
  onClick,
  className = '',
  dodgeDuration = 20000, // 20 seconds default
}: DodgingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDodging, setIsDodging] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    // Cycle: OFF 2s, ON 5s, OFF 2s, ON 5s...
    const cyclePattern = [
      { enabled: false, duration: 2000 },
      { enabled: true, duration: 5000 },
      { enabled: false, duration: 2000 },
      { enabled: true, duration: 5000 },
    ];

    let currentCycle = 0;
    let cycleTimeout: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= dodgeDuration) {
        setIsEnabled(false);
        setIsDodging(false);
        return;
      }

      const cycle = cyclePattern[currentCycle % cyclePattern.length];
      setIsEnabled(cycle.enabled);

      cycleTimeout = setTimeout(() => {
        currentCycle++;
        runCycle();
      }, cycle.duration);
    };

    runCycle();

    return () => clearTimeout(cycleTimeout);
  }, [dodgeDuration]);

  const handleMouseEnter = () => {
    if (!isEnabled || !buttonRef.current) return;

    setIsDodging(true);

    // Calculate new random position
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 20;
    const maxY = window.innerHeight - rect.height - 20;

    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    setPosition({ x: newX, y: newY });

    setTimeout(() => setIsDodging(false), 400);
  };

  const handleClick = () => {
    if (!isEnabled) {
      onClick();
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter}
      className={className}
      style={{
        position: isDodging ? 'fixed' : 'relative',
        left: isDodging ? `${position.x}px` : 'auto',
        top: isDodging ? `${position.y}px` : 'auto',
        opacity: isEnabled ? 0.4 : 1,
        transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isEnabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
