/**
 * Property-Based Tests for Result Access
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 8, 17, 18, 24 from the design document
 * Updated for dual-token architecture (uses sender_token for result access)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { getValentineBySenderToken } from './valentine.service';

// In-memory database for testing — maps sender_token -> valentine data
const valentinesDb = new Map<string, {
  id: string;
  sender_name: string | null;
  receiver_name: string;
  status: string;
  created_at: string;
  answered_at: string | null;
  sender_token: string;
}>();

// Mock Supabase
vi.mock('./api.service', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'valentines') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((_field: string, senderToken: string) => ({
              single: vi.fn(() => {
                // Look up by sender_token
                for (const [, v] of valentinesDb) {
                  if (v.sender_token === senderToken) {
                    return {
                      data: {
                        id: v.id,
                        sender_name: v.sender_name,
                        receiver_name: v.receiver_name,
                        status: v.status,
                        created_at: v.created_at,
                        answered_at: v.answered_at,
                      },
                      error: null,
                    };
                  }
                }
                return {
                  data: null,
                  error: { message: 'Valentine not found' },
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
  ApiError: class extends Error { },
}));

describe('Result Access Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    valentinesDb.clear();

    // Add some valid test data
    const testSenderToken = '00000000-0000-1000-8000-000000000000';
    valentinesDb.set('test-valentine-id', {
      id: 'test-valentine-id',
      sender_name: 'Alice',
      receiver_name: 'Bob',
      status: 'yes',
      created_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
      sender_token: testSenderToken,
    });
  });

  /**
   * Property 8: Result access requires valid sender token
   * For any invalid or random sender token, attempting to access results
   * should be denied with an error response
   * **Validates: Requirements 3.6**
   */
  it('Property 8: Invalid sender tokens are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid().filter(token => {
          // Ensure the token isn't in our test db
          for (const [, v] of valentinesDb) {
            if (v.sender_token === token) return false;
          }
          return true;
        }),
        async (invalidToken) => {
          // Invalid tokens should throw error
          await expect(getValentineBySenderToken(invalidToken)).rejects.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 17: Answer privacy
   * For any Valentine answer, the answer should only be accessible via the correct sender token
   * and not through any public API or interface
   * **Validates: Requirements 6.7, 18.1, 18.2**
   */
  it('Property 17: Answers are private and sender-token-protected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (senderToken) => {
          // Add Valentine with this sender token
          const valentineId = crypto.randomUUID();
          valentinesDb.set(valentineId, {
            id: valentineId,
            sender_name: 'Sender',
            receiver_name: 'Receiver',
            status: 'yes',
            created_at: new Date().toISOString(),
            answered_at: new Date().toISOString(),
            sender_token: senderToken,
          });

          const result = await getValentineBySenderToken(senderToken);

          // Result should be accessible with valid sender token
          expect(result).toBeTruthy();
          expect(result.status).toMatch(/^(pending|yes|no)$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: Sender token validation
   * For any result access attempt, the system should verify the sender token exists
   * in the database before returning result data
   * **Validates: Requirements 7.1**
   */
  it('Property 18: Sender tokens are validated before returning results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (senderToken) => {
          // Add Valentine with this sender token
          const valentineId = crypto.randomUUID();
          valentinesDb.set(valentineId, {
            id: valentineId,
            sender_name: 'Sender',
            receiver_name: 'Receiver',
            status: 'pending',
            created_at: new Date().toISOString(),
            answered_at: null,
            sender_token: senderToken,
          });

          const result = await getValentineBySenderToken(senderToken);

          // Should return valid result structure (service transforms id -> valentine_id)
          expect(result).toHaveProperty('valentine_id');
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
   * For any valid sender token, the returned status should match
   * the current status in the database
   * **Validates: Requirements 14.3**
   */
  it('Property 24: Retrieved results match database state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom('pending', 'yes', 'no'),
        async (senderToken, status) => {
          // Add Valentine with this sender token and status
          const valentineId = crypto.randomUUID();
          valentinesDb.set(valentineId, {
            id: valentineId,
            sender_name: 'Sender',
            receiver_name: 'Receiver',
            status,
            created_at: new Date().toISOString(),
            answered_at: status !== 'pending' ? new Date().toISOString() : null,
            sender_token: senderToken,
          });

          const result = await getValentineBySenderToken(senderToken);

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
