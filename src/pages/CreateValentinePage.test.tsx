import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CreateValentinePage from './CreateValentinePage';
import * as valentineService from '../services/valentine.service';

vi.mock('../services/valentine.service');

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CreateValentinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with receiver and sender name inputs', () => {
    renderWithRouter(<CreateValentinePage />);
    
    expect(screen.getByLabelText(/Who's the lucky person/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Valentine/i })).toBeInTheDocument();
  });

  it('blocks submission when receiver name is empty', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateValentinePage />);
    
    const submitButton = screen.getByRole('button', { name: /Create Valentine/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter the receiver's name/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid receiver name', async () => {
    const user = userEvent.setup();
    const mockCreateValentine = vi.spyOn(valentineService, 'createValentine').mockResolvedValue({
      valentine_id: 'test-id',
      public_url: 'http://localhost/v/test-id',
      result_url: 'http://localhost/r/test-token',
    });

    // Mock navigator.share
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });

    renderWithRouter(<CreateValentinePage />);
    
    const receiverInput = screen.getByLabelText(/Who's the lucky person/i);
    await user.type(receiverInput, 'Jane');
    
    const submitButton = screen.getByRole('button', { name: /Create Valentine/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateValentine).toHaveBeenCalledWith(null, 'Jane');
    });
  });

  it('handles form submission errors', async () => {
    const user = userEvent.setup();
    vi.spyOn(valentineService, 'createValentine').mockRejectedValue(new Error('Network error'));

    renderWithRouter(<CreateValentinePage />);
    
    const receiverInput = screen.getByLabelText(/Who's the lucky person/i);
    await user.type(receiverInput, 'Jane');
    
    const submitButton = screen.getByRole('button', { name: /Create Valentine/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
