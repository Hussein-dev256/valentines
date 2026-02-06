import type { ReactNode } from 'react';

interface SolidContainerProps {
  children: ReactNode;
  className?: string;
}

export default function SolidContainer({ children, className = '' }: SolidContainerProps) {
  return (
    <div className={`solid-container ${className}`}>
      {children}
    </div>
  );
}
