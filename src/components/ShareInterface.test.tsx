import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareInterface from './ShareInterface';

vi.mock('../services/analytics.service', () => ({
  trackEvent: vi.fn(),
  EventTypes: {
    SHARE_TRIGGERED: 'share_triggered',
    SHARE_FALLBACK: 'share_fallback',
  },
}));

describe('ShareInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers native share when available', async () => {
    const user = userEvent.setup();
    const mockShare = vi.fn().mockResolvedValue(undefined);
    
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: mockShare,
    });

    render(<ShareInterface url="http://localhost/v/test-id" />);
    
    const shareButton = screen.getByRole('button', { name: /Share 💌/i });
    await user.click(shareButton);
    
    expect(mockShare).toHaveBeenCalledWith({
      title: 'Will You Be My Valentine?',
      text: 'Will you be my Valentine? 💘 http://localhost/v/test-id',
    });
  });

  it('falls back to clipboard when native share is unavailable', async () => {
    const user = userEvent.setup();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: undefined,
    });
    
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: { writeText: mockWriteText },
    });

    render(<ShareInterface url="http://localhost/v/test-id" />);
    
    const shareButton = screen.getByRole('button', { name: /Share 💌/i });
    await user.click(shareButton);
    
    expect(mockWriteText).toHaveBeenCalledWith('Will you be my Valentine? 💘 http://localhost/v/test-id');
  });

  it('displays success feedback after copying to clipboard', async () => {
    const user = userEvent.setup();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: undefined,
    });
    
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: { writeText: mockWriteText },
    });

    render(<ShareInterface url="http://localhost/v/test-id" />);
    
    const shareButton = screen.getByRole('button', { name: /Share 💌/i });
    await user.click(shareButton);
    
    expect(await screen.findByText(/Link copied 💕/i)).toBeInTheDocument();
  });

  it('displays personalized link text when receiver name is provided', async () => {
    render(<ShareInterface url="http://localhost/v/test-id" receiverName="Kenya" />);
    
    // Should display personalized preview text (not clickable)
    expect(screen.getByText(/Kenya, will you be my Valentine\? 💖/i)).toBeInTheDocument();
  });

  it('displays generic link text when no receiver name is provided', async () => {
    render(<ShareInterface url="http://localhost/v/test-id" />);
    
    // Should display generic preview text (not clickable)
    expect(screen.getByText(/Click here to open your Valentine 💖/i)).toBeInTheDocument();
  });
});
