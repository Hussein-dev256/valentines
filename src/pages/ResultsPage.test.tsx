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

const renderWithRouter = (component: React.ReactElement, token: string = 'test-sender-token') => {
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
    vi.spyOn(valentineService, 'getValentineBySenderToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/WAIT/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Yes… tell me/i })).toBeInTheDocument();
    });
  });

  it('shows result after clicking reveal button', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'getValentineBySenderToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/WAIT/i)).toBeInTheDocument();
    });

    const revealButton = screen.getByRole('button', { name: /Yes… tell me/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(screen.getByText(/THEY SAID YESSS/i)).toBeInTheDocument();
    });
  });

  it('displays pending status when not answered', async () => {
    vi.spyOn(valentineService, 'getValentineBySenderToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
      created_at: new Date().toISOString(),
      answered_at: null,
    });

    renderWithRouter(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Still Waiting/i)).toBeInTheDocument();
      expect(screen.getByText(/haven't answered yet/i)).toBeInTheDocument();
    });
  });

  it('displays celebratory message for YES answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'getValentineBySenderToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/WAIT/i)).toBeInTheDocument();
    });

    const revealButton = screen.getByRole('button', { name: /Yes… tell me/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(screen.getByText(/THEY SAID YESSS/i)).toBeInTheDocument();
      expect(screen.getByText(/behave yourself/i)).toBeInTheDocument();
    });
  });

  it('displays humor-cushioned message for NO answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'getValentineBySenderToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'no',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });

    renderWithRouter(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/WAIT/i)).toBeInTheDocument();
    });

    const revealButton = screen.getByRole('button', { name: /Yes… tell me/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(screen.getByText(/They said NO/i)).toBeInTheDocument();
    });
  });

  it('handles invalid sender token', async () => {
    vi.spyOn(valentineService, 'getValentineBySenderToken').mockRejectedValue(new Error('Not found'));

    renderWithRouter(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid Link/i)).toBeInTheDocument();
    });
  });
});
