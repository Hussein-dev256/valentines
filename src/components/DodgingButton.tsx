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
  dodgeRadius = 150,
  maxDodgeAttempts = 10,
}: DodgingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [isDodgeEnabled, setIsDodgeEnabled] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (!buttonRef.current || !containerRef.current) return { x: 0, y: 0 };

    const button = buttonRef.current.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();

    // Calculate available space
    const maxX = container.width - button.width;
    const maxY = container.height - button.height;

    // Generate random position within bounds
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    return { x: newX, y: newY };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDodgeEnabled || !buttonRef.current) return;

    const button = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = button.left + button.width / 2;
    const buttonCenterY = button.top + button.height / 2;

    const distance = calculateDistance(e.clientX, e.clientY, buttonCenterX, buttonCenterY);

    // Adjust dodge radius based on attempts (progressive difficulty reduction)
    const adjustedRadius = dodgeRadius * (1 - dodgeCount / (maxDodgeAttempts * 2));

    if (distance < adjustedRadius) {
      const newPosition = getRandomPosition();
      setPosition(newPosition);
      setDodgeCount(prev => prev + 1);
    }
  };

  const handleClick = () => {
    if (!isDodgeEnabled) {
      onClick();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-32"
    >
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`absolute transition-all duration-300 ease-out ${className}`}
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
