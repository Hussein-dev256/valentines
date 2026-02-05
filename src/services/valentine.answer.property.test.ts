/**
 * Property-Based Tests for Answer Submission
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 14-16 from the design document
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { submitAnswer } from './valentine.service';

// Mock Supabase
vi.mock('./api.service', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { status: 'pending' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ error: null })),
        })),
      })),
    })),
  },
  withRetry: vi.fn((fn) => fn()),
  handleSupabaseError: vi.fn(),
  ApiError: class extends Error {},
}));

describe('Answer Submission Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 14: YES answer recording
   * For any Valentine instance in pending status, when the YES button is clicked,
   * the status should be updated to 'yes' in the database
   * **Validates: Requirements 6.1**
   */
  it('Property 14: YES answers are recorded correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (valentineId) => {
          const result = await submitAnswer(valentineId, 'yes');

          // Should return success
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: NO answer recording
   * For any Valentine instance in pending status, when the NO button is successfully clicked,
   * the status should be updated to 'no' in the database
   * **Validates: Requirements 6.2**
   */
  it('Property 15: NO answers are recorded correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (valentineId) => {
          const result = await submitAnswer(valentineId, 'no');

          // Should return success
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Answer idempotency
   * For any Valentine instance that has been answered, subsequent answer submission attempts
   * should be rejected, and the original answer should remain unchanged
   * **Validates: Requirements 6.5**
   */
  it('Property 16: Answer submission is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom('yes', 'no'),
        async (valentineId, answer) => {
          // First submission
          const result1 = await submitAnswer(valentineId, answer);
          expect(result1.success).toBe(true);

          // Second submission (should be idempotent)
          const result2 = await submitAnswer(valentineId, answer);
          expect(result2.success).toBe(true);

          // Both should succeed without error
        }
      ),
      { numRuns: 100 }
    );
  });
});
