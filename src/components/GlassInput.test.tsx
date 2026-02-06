import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassInput from './GlassInput';

describe('GlassInput', () => {
  it('renders with label', () => {
    render(
      <GlassInput
        id="test"
        name="test"
        value=""
        onChange={() => {}}
        label="Test Label"
      />
    );
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders with required indicator', () => {
    render(
      <GlassInput
        id="test"
        name="test"
        value=""
        onChange={() => {}}
        label="Test Label"
        required
      />
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <GlassInput
        id="test"
        name="test"
        value=""
        onChange={() => {}}
        error="This field is required"
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <GlassInput
        id="test"
        name="test"
        value=""
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies glass-input class', () => {
    render(
      <GlassInput
        id="test"
        name="test"
        value=""
        onChange={() => {}}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('solid-input');
  });
});
