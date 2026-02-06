import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ResultsPage from './ResultsPage';
import * as valentineService from '../services/valentine.service';

vi.mock('../services/valentine.service');
vi.mock('../services/analytics.service', () => ({
  trackEvent: vi.fn(),
  EventTypes: {
    RESULT_VIEWED: 'result_viewed',
  },
}));

const renderWithRouter = (component: React.ReactElement, token: string = 'test-token') => {
  window.history.pushState({}, 'Test page', `/r/${token}`);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/r/:token" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays warning screen before showing result', async () => {
    vi.spyOn(valentineService, 'getResult').mockResolvedValue({
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/The Moment of Truth/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Show Me The Result/i })).toBeInTheDocument();
    });
  });

  it('shows result after clicking reveal button', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'getResult').mockResolvedValue({
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/The Moment of Truth/i)).toBeInTheDocument();
    });

    const revealButton = screen.getByRole('button', { name: /Show Me The Result/i });
    await user.click(revealButton);
    
    await waitFor(() => {
      expect(screen.getByText(/They Said YES!/i)).toBeInTheDocument();
    });
  });

  it('displays pending status when not answered', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'getResult').mockResolvedValue({
      status: 'pending',
      created_at: new Date().toISOString(),
      answered_at: null,
    });

    renderWithRouter(<ResultsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/The Moment of Truth/i)).toBeInTheDocument();
    });

    const revealButton = screen.getByRole('button', { name: /Show Me The Result/i });
    await user.click(revealButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Still Waiting/i)).toBeInTheDocument();
    });
  });

  it('displays celebratory message for YES answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'getResult').mockResolvedValue({
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/The Moment of Truth/i)).toBeInTheDocument();
    });

    const revealButton = screen.getByRole('button', { name: /Show Me The Result/i });
    await user.click(revealButton);
    
    await waitFor(() => {
      expect(screen.getByText(/They Said YES!/i)).toBeInTheDocument();
      expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
    });
  });

  it('displays humor-cushioned message for NO answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'getResult').mockResolvedValue({
      status: 'no',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/The Moment of Truth/i)).toBeInTheDocument();
    });

    const revealButton = screen.getByRole('button', { name: /Show Me The Result/i });
    await user.click(revealButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Not This Time/i)).toBeInTheDocument();
      expect(screen.getByText(/courage/i)).toBeInTheDocument();
    });
  });

  it('handles invalid token error', async () => {
    vi.spyOn(valentineService, 'getResult').mockRejectedValue(new Error('Invalid result token'));

    renderWithRouter(<ResultsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid result token/i)).toBeInTheDocument();
    });
  });
});
