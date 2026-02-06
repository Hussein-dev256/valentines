import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import OriginPage from './OriginPage';

// Mock the analytics service
vi.mock('../services/analytics.service', () => ({
  trackEvent: vi.fn(),
  EventTypes: {
    ORIGIN_VIEW: 'origin_view',
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('OriginPage', () => {
  it('renders correctly with introduction message', () => {
    renderWithRouter(<OriginPage />);
    
    expect(screen.getByText(/WILL Y/i)).toBeInTheDocument();
    expect(screen.getByText(/U BE MY/i)).toBeInTheDocument();
    expect(screen.getByText(/Valentine\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Got your eyes on someone/i)).toBeInTheDocument();
  });

  it('displays CTA button', () => {
    renderWithRouter(<OriginPage />);
    
    const ctaButton = screen.getByRole('button', { name: /Ask them out/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('navigates to create page when CTA is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<OriginPage />);
    
    const ctaButton = screen.getByRole('button', { name: /Ask them out/i });
    await user.click(ctaButton);
    
    // Check if navigation occurred (URL should change)
    expect(window.location.pathname).toBe('/create');
  });

  it('displays footer attribution', () => {
    renderWithRouter(<OriginPage />);
    
    expect(screen.getByText(/Made with love by Web Developer Uganda/i)).toBeInTheDocument();
  });
});
