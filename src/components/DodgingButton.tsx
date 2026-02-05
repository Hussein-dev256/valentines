import { useState, useEffect, useRef, type MouseEvent } from 'react';

interface DodgingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  dodgeRadius?: number;
  maxDodgeAttempts?: number;
}

export default function DodgingButton({
  onClick,
  children,
  className = '',
  dodgeRadius = 120,
  maxDodgeAttempts = 8,
}: DodgingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [isDodgeEnabled, setIsDodgeEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize button position in center
  useEffect(() => {
    if (!isInitialized && buttonRef.current && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const button = buttonRef.current.getBoundingClientRect();
      
      const centerX = (container.width - button.width) / 2;
      const centerY = (container.height - button.height) / 2;
      
      setPosition({ x: centerX, y: centerY });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    // Disable dodge after max attempts
    if (dodgeCount >= maxDodgeAttempts) {
      setIsDodgeEnabled(false);
    }
  }, [dodgeCount, maxDodgeAttempts]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const getRandomPosition = () => {
    if (!buttonRef.current || !containerRef.current) return position;

    const button = buttonRef.current.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();

    // Calculate available space
    const maxX = container.width - button.width;
    const maxY = container.height - button.height;

    // Ensure minimum distance from current position
    let newX, newY, attempts = 0;
    do {
      newX = Math.random() * maxX;
      newY = Math.random() * maxY;
      attempts++;
    } while (
      attempts < 10 &&
      calculateDistance(position.x, position.y, newX, newY) < 100
    );

    return { x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDodgeEnabled || !buttonRef.current || !isInitialized) return;

    const button = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = button.left + button.width / 2;
    const buttonCenterY = button.top + button.height / 2;

    const distance = calculateDistance(e.clientX, e.clientY, buttonCenterX, buttonCenterY);

    // Adjust dodge radius based on attempts (progressive difficulty reduction)
    const adjustedRadius = dodgeRadius * Math.max(0.3, 1 - dodgeCount / (maxDodgeAttempts * 1.5));

    if (distance < adjustedRadius) {
      const newPosition = getRandomPosition();
      setPosition(newPosition);
      setDodgeCount(prev => prev + 1);
    }
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Only allow click if dodge is disabled
    if (!isDodgeEnabled) {
      onClick();
    } else {
      // Prevent click and dodge away
      e.preventDefault();
      const newPosition = getRandomPosition();
      setPosition(newPosition);
      setDodgeCount(prev => prev + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-40"
    >
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`absolute transition-all duration-200 ease-out ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {children}
      </button>
    </div>
  );
}
