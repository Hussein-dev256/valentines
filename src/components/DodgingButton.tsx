import { useState, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';

interface DodgingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  dodgeRadius?: number;
  dodgeDuration?: number; // Duration in seconds (15-25 seconds)
}

export default function DodgingButton({
  onClick,
  children,
  className = '',
  dodgeRadius = 150,
  dodgeDuration = 20, // Default 20 seconds
}: DodgingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDodgeEnabled, setIsDodgeEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldSwap, setShouldSwap] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastDodgeTimeRef = useRef<number>(0);

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
      setScale(1);
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

    // Calculate available space with padding
    const padding = 10;
    const maxX = container.width - button.width - padding;
    const maxY = container.height - button.height - padding;

    // Ensure minimum distance from current position
    let newX, newY, attempts = 0;
    do {
      newX = Math.random() * maxX + padding;
      newY = Math.random() * maxY + padding;
      attempts++;
    } while (
      attempts < 10 &&
      calculateDistance(position.x, position.y, newX, newY) < 100
    );

    return { x: Math.max(padding, Math.min(newX, maxX)), y: Math.max(padding, Math.min(newY, maxY)) };
  };

  const performDodge = () => {
    // Throttle dodges to prevent too frequent movements
    const now = Date.now();
    if (now - lastDodgeTimeRef.current < 300) return;
    lastDodgeTimeRef.current = now;

    // Random behavior selection
    const behavior = Math.random();
    
    if (behavior < 0.25) {
      // 25% chance: Swap text
      setShouldSwap(true);
      setTimeout(() => setShouldSwap(false), 800);
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    } else if (behavior < 0.5) {
      // 25% chance: Spin and move
      setRotation(prev => prev + 360);
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    } else if (behavior < 0.7) {
      // 20% chance: Scale down (shrink) and move
      setScale(0.7);
      setTimeout(() => setScale(1), 400);
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    } else {
      // 30% chance: Just move away
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    }
  };

  // Desktop: Mouse move detection
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDodgeEnabled || !buttonRef.current || !isInitialized) return;

    const button = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = button.left + button.width / 2;
    const buttonCenterY = button.top + button.height / 2;

    const distance = calculateDistance(e.clientX, e.clientY, buttonCenterX, buttonCenterY);

    if (distance < dodgeRadius) {
      performDodge();
    }
  };

  // Mobile: Touch start detection (when user tries to tap)
  const handleTouchStart = (e: TouchEvent<HTMLButtonElement>) => {
    if (!isDodgeEnabled) {
      // Allow the click to proceed
      return;
    }

    // Dodge on touch
    e.preventDefault();
    performDodge();
  };

  // Handle click/tap
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!isDodgeEnabled) {
      onClick();
    } else {
      // Desktop: Prevent click and dodge
      e.preventDefault();
      performDodge();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-40"
      style={{ touchAction: 'none' }} // Prevent default touch behaviors
    >
      <button
        ref={buttonRef}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        className={`absolute transition-all duration-300 ease-out ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          pointerEvents: 'auto', // Ensure button is always interactive
        }}
      >
        {shouldSwap ? 'YES 😍' : children}
      </button>
    </div>
  );
}
