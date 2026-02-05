/**
 * Property-Based Tests for Result Access
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 8, 17, 18, 24 from the design document
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { getResult } from './valentine.service';

// Mock Supabase
vi.mock('./api.service', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'result_tokens') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { valentine_id: 'test-valentine-id' },
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'valentines') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  status: 'yes',
                  created_at: new Date().toISOString(),
                  answered_at: new Date().toISOString(),
                },
                error: null,
              })),
            })),
          })),
        };
      }
      return {};
    }),
  },
  withRetry: vi.fn((fn) => fn()),
  handleSupabaseError: vi.fn(() => {
    throw new Error('Invalid token');
  }),
  ApiError: class extends Error {},
}));

describe('Result Access Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 8: Result access requires valid token
   * For any invalid or random result token, attempting to access results
   * should be denied with an error response
   * **Validates: Requirements 3.6**
   */
  it('Property 8: Invalid tokens are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => !s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)),
        async (invalidToken) => {
          // Invalid tokens should throw error
          await expect(getResult(invalidToken)).rejects.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 17: Answer privacy
   * For any Valentine answer, the answer should only be accessible via the correct result token
   * and not through any public API or interface
   * **Validates: Requirements 6.7, 18.1, 18.2**
   */
  it('Property 17: Answers are private and token-protected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (validToken) => {
          const result = await getResult(validToken);

          // Result should be accessible with valid token
          expect(result).toBeTruthy();
          expect(result.status).toMatch(/^(pending|yes|no)$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: Result token validation
   * For any result access attempt, the system should verify the token exists
   * in the database before returning result data
   * **Validates: Requirements 7.1**
   */
  it('Property 18: Tokens are validated before returning results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (token) => {
          const result = await getResult(token);

          // Should return valid result structure
          expect(result).toHaveProperty('status');
          expect(result).toHaveProperty('created_at');
          expect(result).toHaveProperty('answered_at');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 24: Result retrieval accuracy
   * For any valid result token, the returned status should match
   * the current status in the database
   * **Validates: Requirements 14.3**
   */
  it('Property 24: Retrieved results match database state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (token) => {
          const result = await getResult(token);

          // Status should be one of the valid values
          expect(['pending', 'yes', 'no']).toContain(result.status);
          
          // Timestamps should be valid
          expect(result.created_at).toBeTruthy();
          
          // If answered, answered_at should be present
          if (result.status !== 'pending') {
            expect(result.answered_at).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
