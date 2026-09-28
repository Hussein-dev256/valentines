import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ReceiverPage from './ReceiverPage';
import * as valentineService from '../services/valentine.service';

vi.mock('../services/valentine.service');
vi.mock('../components/DodgingButton', () => ({
  default: ({ children, onClick, className, disabled }: any) => (
    <button onClick={onClick} className={className} disabled={disabled}>{children}</button>
  ),
}));
vi.mock('../services/analytics.service', () => ({
  trackEvent: vi.fn(),
  EventTypes: {
    RECEIVER_OPENED: 'receiver_opened',
    ANSWERED_YES: 'answered_yes',
    ANSWERED_NO: 'answered_no',
  },
}));

const renderWithRouter = (receiverToken: string = 'test-receiver-token') => {
  window.history.pushState({}, 'Test page', `/v/${receiverToken}`);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/v/:token" element={<ReceiverPage />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ReceiverPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays Valentine with sender name', async () => {
    vi.spyOn(valentineService, 'getValentineByReceiverToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Jane,/i)).toBeInTheDocument();
      expect(screen.getByText(/WILL Y/i)).toBeInTheDocument();
      expect(screen.getByText(/BE MY/i)).toBeInTheDocument();
      expect(screen.getByText(/VALENTINE\?/i)).toBeInTheDocument();
      expect(screen.getByText(/From:/i)).toBeInTheDocument();
      expect(screen.getByText(/John/i)).toBeInTheDocument();
    });
  });

  it('displays Valentine without sender name (anonymous)', async () => {
    vi.spyOn(valentineService, 'getValentineByReceiverToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: null,
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Jane,/i)).toBeInTheDocument();
      expect(screen.getByText(/WILL Y/i)).toBeInTheDocument();
      expect(screen.getByText(/BE MY/i)).toBeInTheDocument();
      expect(screen.getByText(/VALENTINE\?/i)).toBeInTheDocument();
      expect(screen.getByText(/From:/i)).toBeInTheDocument();
    });
  });

  it('handles YES button click', async () => {
    const user = userEvent.setup();
    const mockSubmitAnswer = vi.spyOn(valentineService, 'submitAnswerByReceiverToken').mockResolvedValue({ success: true });

    vi.spyOn(valentineService, 'getValentineByReceiverToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Jane,/i)).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /YES!/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(mockSubmitAnswer).toHaveBeenCalledWith('test-receiver-token', 'yes');
    });
  });

  it('displays celebratory message after YES answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'submitAnswerByReceiverToken').mockResolvedValue({ success: true });
    vi.spyOn(valentineService, 'getValentineByReceiverToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Jane,/i)).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /YES!/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(screen.getByText(/AYYYYY/i)).toBeInTheDocument();
    });
  });

  it('displays respectful message after NO answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'submitAnswerByReceiverToken').mockResolvedValue({ success: true });
    vi.spyOn(valentineService, 'getValentineByReceiverToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'pending',
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Jane,/i)).toBeInTheDocument();
    });

    const noButton = screen.getByRole('button', { name: /NO/i });
    await user.click(noButton);

    await waitFor(() => {
      expect(screen.getByText(/Got it/i)).toBeInTheDocument();
    });
  });

  it('shows not found for invalid token', async () => {
    vi.spyOn(valentineService, 'getValentineByReceiverToken').mockRejectedValue(new Error('Not found'));
    vi.spyOn(valentineService, 'getReceiverTokenByValentineId').mockResolvedValue(null);

    renderWithRouter('invalid-token');

    await waitFor(() => {
      expect(screen.getByText(/Valentine Not Found/i)).toBeInTheDocument();
    });
  });

  it('shows already answered state when valentine is answered', async () => {
    vi.spyOn(valentineService, 'getValentineByReceiverToken').mockResolvedValue({
      valentine_id: 'test-id',
      sender_name: 'John',
      receiver_name: 'Jane',
      status: 'yes',
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/AYYYYY/i)).toBeInTheDocument();
    });
  });
});
