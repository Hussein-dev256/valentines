import React from 'react';
import FavIcon from '../assets/icons/fav-icon.svg?react';

export interface AppIconProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  animated?: boolean;
}

/**
 * AppIcon - Displays the app's brand icon
 * 
 * Features:
 * - Multiple size variants
 * - Optional floating animation
 * - Responsive sizing
 * - SVG-based for crisp rendering
 * 
 * @example
 * ```tsx
 * <AppIcon size="medium" animated />
 * ```
 */
const AppIcon: React.FC<AppIconProps> = ({
  size = 'medium',
  className = '',
  animated = false,
}) => {
  const sizeClass = `app-icon-${size}`;
  const animatedClass = animated ? 'app-icon-animated' : '';
  
  return (
    <div className={`app-icon ${sizeClass} ${animatedClass} ${className}`}>
      <FavIcon />
    </div>
  );
};

export default AppIcon;
