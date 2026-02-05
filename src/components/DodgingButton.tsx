import { useState, useEffect, useRef, type MouseEvent } from 'react';

interface DodgingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  dodgeRadius?: number;
  dodgeDuration?: number; // Duration in seconds (25-45 seconds)
}

export default function DodgingButton({
  onClick,
  children,
  className = '',
  dodgeRadius = 150,
  dodgeDuration = 35, // Default 35 seconds
}: DodgingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDodgeEnabled, setIsDodgeEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldSwap, setShouldSwap] = useState(false);
  const [rotation, setRotation] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize button position in center
  useEffect(() => {
    if (!isInitialized && buttonRef.current && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const button = buttonRef.current.getBoundingClientRect();
      
      const centerX = (container.width - button.width) / 2;
      const centerY = (container.height - button.height) / 2;
      
      setPosition({ x: centerX, y: centerY });
      setIsInitialized(true);
      startTimeRef.current = Date.now();
    }
  }, [isInitialized]);

  // Disable dodge after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDodgeEnabled(false);
      setShouldSwap(false);
      setRotation(0);
    }, dodgeDuration * 1000);

    return () => clearTimeout(timer);
  }, [dodgeDuration]);

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

    if (distance < dodgeRadius) {
      // Random behavior selection
      const behavior = Math.random();
      
      if (behavior < 0.3 && yesButtonRef.current) {
        // 30% chance: Swap with YES button
        setShouldSwap(true);
        setTimeout(() => setShouldSwap(false), 800);
      } else if (behavior < 0.5) {
        // 20% chance: Spin
        setRotation(prev => prev + 360);
        const newPosition = getRandomPosition();
        setPosition(newPosition);
      } else {
        // 50% chance: Just move away
        const newPosition = getRandomPosition();
        setPosition(newPosition);
      }
    }
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!isDodgeEnabled) {
      onClick();
    } else {
      // Prevent click and dodge away with spin
      e.preventDefault();
      setRotation(prev => prev + 720);
      const newPosition = getRandomPosition();
      setPosition(newPosition);
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
        className={`absolute transition-all duration-300 ease-out ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {shouldSwap ? 'YES 😍' : children}
      </button>
    </div>
  );
}
