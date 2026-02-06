import { useState, useEffect, useRef, type ReactNode } from 'react';

interface DodgingButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  dodgeDuration?: number;
  dodgeRadius?: number; // For test compatibility
  disabled?: boolean;
}

export default function DodgingButton({
  children,
  onClick,
  className = '',
  dodgeDuration = 24000, // 24 seconds total (3 cycles of 6s ON + 2s OFF)
  disabled = false,
}: DodgingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDodging, setIsDodging] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [shouldSwap, setShouldSwap] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    // Cycle: ON 6s, OFF 2s, ON 6s, OFF 2s, ON 6s, OFF 2s (24 seconds total)
    const cyclePattern = [
      { enabled: true, duration: 6000 },   // ON for 6 seconds
      { enabled: false, duration: 2000 },  // OFF for 2 seconds
      { enabled: true, duration: 6000 },   // ON for 6 seconds
      { enabled: false, duration: 2000 },  // OFF for 2 seconds
      { enabled: true, duration: 6000 },   // ON for 6 seconds
      { enabled: false, duration: 2000 },  // OFF for 2 seconds
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

  // Find YES button to swap positions with
  useEffect(() => {
    if (buttonRef.current) {
      const parent = buttonRef.current.parentElement;
      if (parent) {
        const buttons = parent.querySelectorAll('button');
        buttons.forEach(btn => {
          if (btn !== buttonRef.current && btn.textContent?.includes('YES')) {
            yesButtonRef.current = btn as HTMLButtonElement;
          }
        });
      }
    }
  }, []);

  const handleMouseEnter = () => {
    if (!isEnabled || !buttonRef.current || disabled) return;

    setIsDodging(true);

    // Random dodge behavior
    const dodgeType = Math.random();
    
    if (dodgeType < 0.3 && yesButtonRef.current) {
      // 30% chance: Swap positions with YES button
      setShouldSwap(true);
      setTimeout(() => setShouldSwap(false), 400);
    } else if (dodgeType < 0.6) {
      // 30% chance: Spin
      setRotation(prev => prev + (Math.random() > 0.5 ? 360 : -360));
    } else {
      // 40% chance: Move to random position
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 20;
      const maxY = window.innerHeight - rect.height - 20;

      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;

      setPosition({ x: newX, y: newY });
    }

    setTimeout(() => {
      setIsDodging(false);
      setRotation(0);
    }, 400);
  };

  const handleClick = () => {
    if (!isEnabled && !disabled) {
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
      disabled={disabled}
      style={{
        position: isDodging && !shouldSwap ? 'fixed' : 'relative',
        left: isDodging && !shouldSwap ? `${position.x}px` : 'auto',
        top: isDodging && !shouldSwap ? `${position.y}px` : 'auto',
        opacity: disabled ? 0.5 : (isEnabled ? 0.5 : 1),
        transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled ? 'not-allowed' : (isEnabled ? 'not-allowed' : 'pointer'),
        transform: `rotate(${rotation}deg)`,
        order: shouldSwap ? -1 : 0,
      }}
    >
      {children}
    </button>
  );
}
