import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AppIcon from './AppIcon';

describe('AppIcon', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppIcon />);
    expect(container.querySelector('.app-icon')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<AppIcon size="small" />);
    expect(container.querySelector('.app-icon-small')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    const { container } = render(<AppIcon />);
    expect(container.querySelector('.app-icon-medium')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<AppIcon size="large" />);
    expect(container.querySelector('.app-icon-large')).toBeInTheDocument();
  });

  it('applies xlarge size class', () => {
    const { container } = render(<AppIcon size="xlarge" />);
    expect(container.querySelector('.app-icon-xlarge')).toBeInTheDocument();
  });

  it('applies animated class when animated prop is true', () => {
    const { container } = render(<AppIcon animated />);
    expect(container.querySelector('.app-icon-animated')).toBeInTheDocument();
  });

  it('does not apply animated class when animated prop is false', () => {
    const { container } = render(<AppIcon animated={false} />);
    expect(container.querySelector('.app-icon-animated')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AppIcon className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders SVG icon', () => {
    const { container } = render(<AppIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
