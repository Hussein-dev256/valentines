import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ReceiverPage from './ReceiverPage';
import * as valentineService from '../services/valentine.service';

vi.mock('../services/valentine.service');
vi.mock('../services/analytics.service', () => ({
  trackEvent: vi.fn(),
  EventTypes: {
    RECEIVER_OPENED: 'receiver_opened',
    ANSWERED_YES: 'answered_yes',
    ANSWERED_NO: 'answered_no',
  },
}));

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/v/:id" element={<ReceiverPage />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ReceiverPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays Valentine with sender name', async () => {
    vi.spyOn(valentineService, 'getValentine').mockResolvedValue({
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Jane, Will You Be My Valentine/i)).toBeInTheDocument();
      expect(screen.getByText(/From: John/i)).toBeInTheDocument();
    });
  });

  it('displays Valentine without sender name (anonymous)', async () => {
    vi.spyOn(valentineService, 'getValentine').mockResolvedValue({
      sender_name: null,
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Jane, Will You Be My Valentine/i)).toBeInTheDocument();
      expect(screen.getByText(/From: Someone/i)).toBeInTheDocument();
    });
  });

  it('handles YES button click', async () => {
    const user = userEvent.setup();
    const mockSubmitAnswer = vi.spyOn(valentineService, 'submitAnswer').mockResolvedValue({ success: true });
    
    vi.spyOn(valentineService, 'getValentine').mockResolvedValue({
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Jane, Will You Be My Valentine/i)).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /YES!/i });
    await user.click(yesButton);
    
    await waitFor(() => {
      expect(mockSubmitAnswer).toHaveBeenCalled();
    });
  });

  it('displays celebratory message after YES answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'submitAnswer').mockResolvedValue({ success: true });
    vi.spyOn(valentineService, 'getValentine').mockResolvedValue({
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Jane, Will You Be My Valentine/i)).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /YES!/i });
    await user.click(yesButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Yay!/i)).toBeInTheDocument();
    });
  });

  it('displays respectful message after NO answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'submitAnswer').mockResolvedValue({ success: true });
    vi.spyOn(valentineService, 'getValentine').mockResolvedValue({
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Jane, Will You Be My Valentine/i)).toBeInTheDocument();
    });

    const noButton = screen.getByRole('button', { name: /NO/i });
    await user.click(noButton);
    
    await waitFor(() => {
      expect(screen.getByText(/All good!/i)).toBeInTheDocument();
    });
  });

  it('handles error when fetching Valentine', async () => {
    vi.spyOn(valentineService, 'getValentine').mockRejectedValue(new Error('Valentine not found'));

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Valentine not found/i)).toBeInTheDocument();
    });
  });
});
