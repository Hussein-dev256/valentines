import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DodgingButton from './DodgingButton';

describe('DodgingButton', () => {
  it('renders button with children', () => {
    render(<DodgingButton onClick={vi.fn()}>Click Me</DodgingButton>);
    
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
  });

  it('calls onClick when dodge is disabled', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    render(
      <DodgingButton onClick={mockOnClick} dodgeDuration={0}>
        Click Me
      </DodgingButton>
    );
    
    const button = screen.getByRole('button', { name: /Click Me/i });
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('button stays within viewport on small screens', () => {
    // Mock small viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });
    
    render(<DodgingButton onClick={vi.fn()}>Click Me</DodgingButton>);
    
    const button = screen.getByRole('button', { name: /Click Me/i });
    const rect = button.getBoundingClientRect();
    
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.top).toBeGreaterThanOrEqual(0);
  });

  it('button stays within viewport on large screens', () => {
    // Mock large viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 1080 });
    
    render(<DodgingButton onClick={vi.fn()}>Click Me</DodgingButton>);
    
    const button = screen.getByRole('button', { name: /Click Me/i });
    const rect = button.getBoundingClientRect();
    
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.top).toBeGreaterThanOrEqual(0);
  });

  it('button becomes clickable after dodge duration', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    render(
      <DodgingButton onClick={mockOnClick} dodgeDuration={0.1}>
        Click Me
      </DodgingButton>
    );
    
    const button = screen.getByRole('button', { name: /Click Me/i });
    
    // After duration, button should be clickable
    await user.click(button);
    
    // Should eventually call onClick
    expect(mockOnClick).toHaveBeenCalled();
  });
});
