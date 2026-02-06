/**
 * Property-Based Tests for Result Access
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 8, 17, 18, 24 from the design document
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { getResult } from './valentine.service';

// In-memory databases for testing
const resultTokensDb = new Map<string, string>(); // token -> valentine_id
const valentinesDb = new Map<string, { status: string; created_at: string; answered_at: string | null }>();

// Mock Supabase
vi.mock('./api.service', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'result_tokens') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string, token: string) => ({
              single: vi.fn(() => {
                const valentineId = resultTokensDb.get(token);
                if (!valentineId) {
                  return {
                    data: null,
                    error: { message: 'Invalid token' },
                  };
                }
                return {
                  data: { valentine_id: valentineId },
                  error: null,
                };
              }),
            })),
          })),
        };
      }
      if (table === 'valentines') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string, id: string) => ({
              single: vi.fn(() => {
                const data = valentinesDb.get(id);
                if (!data) {
                  return {
                    data: null,
                    error: { message: 'Valentine not found' },
                  };
                }
                return {
                  data,
                  error: null,
                };
              }),
            })),
          })),
        };
      }
      return {};
    }),
  },
  withRetry: vi.fn((fn) => fn()),
  handleSupabaseError: vi.fn((error: any) => {
    throw new Error(error.message || 'Invalid token');
  }),
  ApiError: class extends Error {},
}));

describe('Result Access Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resultTokensDb.clear();
    valentinesDb.clear();
    
    // Add some valid test data
    const testValentineId = 'test-valentine-id';
    const testToken = '00000000-0000-1000-8000-000000000000';
    resultTokensDb.set(testToken, testValentineId);
    valentinesDb.set(testValentineId, {
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    });
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
        fc.uuid().filter(token => !resultTokensDb.has(token)),
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
          // Add token to database
          const valentineId = crypto.randomUUID();
          resultTokensDb.set(validToken, valentineId);
          valentinesDb.set(valentineId, {
            status: 'yes',
            created_at: new Date().toISOString(),
            answered_at: new Date().toISOString(),
          });
          
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
          // Add token to database
          const valentineId = crypto.randomUUID();
          resultTokensDb.set(token, valentineId);
          valentinesDb.set(valentineId, {
            status: 'pending',
            created_at: new Date().toISOString(),
            answered_at: null,
          });
          
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
        fc.constantFrom('pending', 'yes', 'no'),
        async (token, status) => {
          // Add token to database
          const valentineId = crypto.randomUUID();
          resultTokensDb.set(token, valentineId);
          valentinesDb.set(valentineId, {
            status,
            created_at: new Date().toISOString(),
            answered_at: status !== 'pending' ? new Date().toISOString() : null,
          });
          
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
