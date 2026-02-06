import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock crypto.randomUUID for consistent testing
if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
  } as any;
}

// Mock SVG imports
vi.mock('*.svg?react', () => ({
  default: React.forwardRef((props: any, ref: any) => 
    React.createElement('svg', { ...props, ref, 'data-testid': 'mock-svg' })
  ),
}));

// Mock canvas-confetti to prevent canvas errors in tests
vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => null),
}));
