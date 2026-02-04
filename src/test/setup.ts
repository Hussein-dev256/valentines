import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

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
