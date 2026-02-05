import { useState, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';

interface DodgingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  dodgeRadius?: number;
  dodgeDuration?: number; // Duration in seconds (15-25 seconds)
  yesButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onSwapRequest?: () => void;
}

export default function DodgingButton({
  onClick,
  children,
  className = '',
  dodgeRadius = 150,
  dodgeDuration = 20, // Default 20 seconds
  onSwapRequest,
}: DodgingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDodgeEnabled, setIsDodgeEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldSwap, setShouldSwap] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false); // Start disabled
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastDodgeTimeRef = useRef<number>(0);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setIsButtonEnabled(true); // Enable permanently after duration
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    }, dodgeDuration * 1000);

    return () => {
      clearTimeout(timer);
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    };
  }, [dodgeDuration]);

  // Enable/Disable cycle: OFF 2s, ON 5s, OFF 2s, ON 5s...
  useEffect(() => {
    if (!isDodgeEnabled) return;

    let currentState = false; // Start disabled
    let cycleTimeout: ReturnType<typeof setTimeout> | null = null;
    setIsButtonEnabled(false);

    const runCycle = () => {
      if (!isDodgeEnabled) return;
      
      if (!currentState) {
        // Currently disabled, enable for 5 seconds
        setIsButtonEnabled(true);
        currentState = true;
        cycleTimeout = setTimeout(() => {
          if (isDodgeEnabled) {
            setIsButtonEnabled(false);
            currentState = false;
            cycleTimeout = setTimeout(runCycle, 2000);
          }
        }, 5000);
      } else {
        // Currently enabled, disable for 2 seconds
        setIsButtonEnabled(false);
        currentState = false;
        cycleTimeout = setTimeout(() => {
          if (isDodgeEnabled) {
            setIsButtonEnabled(true);
            currentState = true;
            cycleTimeout = setTimeout(runCycle, 5000);
          }
        }, 2000);
      }
    };

    // Start with 2 second disabled period
    const initialTimer = setTimeout(() => {
      runCycle();
    }, 2000);

    return () => {
      clearTimeout(initialTimer);
      if (cycleTimeout) clearTimeout(cycleTimeout);
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    };
  }, [isDodgeEnabled]);

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
    if (!isButtonEnabled) return; // Don't dodge if button is in disabled cycle

    // Throttle dodges to prevent too frequent movements
    const now = Date.now();
    if (now - lastDodgeTimeRef.current < 400) return;
    lastDodgeTimeRef.current = now;

    // Random behavior selection
    const behavior = Math.random();
    
    if (behavior < 0.2 && onSwapRequest) {
      // 20% chance: Request position swap with YES button
      onSwapRequest();
      setShouldSwap(true);
      setTimeout(() => setShouldSwap(false), 1000);
    } else if (behavior < 0.4) {
      // 20% chance: Spin 360° and move
      setRotation(prev => prev + 360);
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    } else if (behavior < 0.6) {
      // 20% chance: Scale down (shrink) and move
      setScale(0.5);
      setTimeout(() => setScale(1), 400);
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    } else if (behavior < 0.8) {
      // 20% chance: Spin 720° (double spin) and move
      setRotation(prev => prev + 720);
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    } else {
      // 20% chance: Just move away
      const newPosition = getRandomPosition();
      setPosition(newPosition);
    }
  };

  // Desktop: Mouse move detection
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDodgeEnabled || !buttonRef.current || !isInitialized || !isButtonEnabled) return;

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
    if (!isDodgeEnabled || !isButtonEnabled) {
      // Allow the click to proceed if dodge is disabled or button is enabled
      if (!isDodgeEnabled) return;
    }

    // Dodge on touch if enabled
    e.preventDefault();
    performDodge();
  };

  // Handle click/tap
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!isDodgeEnabled) {
      onClick();
    } else if (isButtonEnabled) {
      // Desktop: Prevent click and dodge
      e.preventDefault();
      performDodge();
    } else {
      // Button is in disabled cycle, don't respond
      e.preventDefault();
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
        disabled={!isButtonEnabled && isDodgeEnabled}
        className={`absolute transition-all duration-400 ease-out ${className} ${
          !isButtonEnabled && isDodgeEnabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          pointerEvents: 'auto',
        }}
      >
        {shouldSwap ? 'YES 😍' : children}
      </button>
    </div>
  );
}
