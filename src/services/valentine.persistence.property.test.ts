/**
 * Property-Based Tests for Data Persistence
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 19-23, 25-26 from the design document
 * Updated for dual-token architecture (sender_token + receiver_token)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { createValentine, submitAnswerByReceiverToken, getValentineByReceiverToken } from './valentine.service';

// In-memory database for testing
const valentinesDb = new Map<string, {
  id: string;
  sender_name: string | null;
  receiver_name: string;
  status: string;
  receiver_token: string;
  sender_token: string;
}>();

// Mock senderIdentity
vi.mock('../utils/senderIdentity', () => ({
  generateSenderId: vi.fn(() => 'mock-sender-id'),
  storeSenderMapping: vi.fn(),
}));

// Mock Supabase
vi.mock('./api.service', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'valentines') {
        return {
          insert: vi.fn((data: any) => {
            valentinesDb.set(data.id, {
              id: data.id,
              sender_name: data.sender_name,
              receiver_name: data.receiver_name,
              status: data.status,
              receiver_token: data.receiver_token,
              sender_token: data.sender_token,
            });
            return { error: null };
          }),
          select: vi.fn(() => ({
            eq: vi.fn((_field: string, value: string) => ({
              single: vi.fn(() => {
                // Look up by receiver_token
                for (const [, v] of valentinesDb) {
                  if (v.receiver_token === value) {
                    return {
                      data: { id: v.id, sender_name: v.sender_name, receiver_name: v.receiver_name, status: v.status },
                      error: null,
                    };
                  }
                }
                return {
                  data: null,
                  error: { message: 'Not found' },
                };
              }),
            })),
          })),
          update: vi.fn((data: any) => ({
            eq: vi.fn((_field: string, value: string) => ({
              eq: vi.fn(() => {
                // Look up by receiver_token and update if pending
                for (const [key, v] of valentinesDb) {
                  if (v.receiver_token === value && v.status === 'pending') {
                    valentinesDb.set(key, { ...v, status: data.status });
                  }
                }
                return { error: null };
              }),
            })),
          })),
        };
      }
      if (table === 'result_tokens') {
        return {
          insert: vi.fn(() => ({ error: null })),
        };
      }
      return {};
    }),
  },
  withRetry: vi.fn((fn) => fn()),
  handleSupabaseError: vi.fn(),
  ApiError: class extends Error { },
}));

describe('Data Persistence Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    valentinesDb.clear();
  });

  /**
   * Property 19: Valentine instance isolation
   * For any two distinct Valentine instances, answering one should not affect
   * the status or data of the other
   * **Validates: Requirements 10.2**
   */
  it('Property 19: Valentine instances are isolated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)),
        fc.tuple(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)),
        async ([receiver1, sender1], [receiver2, sender2]) => {
          // Create two Valentines
          const valentine1 = await createValentine(sender1, receiver1);
          const valentine2 = await createValentine(sender2, receiver2);

          // IDs should be different
          expect(valentine1.valentine_id).not.toBe(valentine2.valentine_id);

          // Answer first Valentine using its receiver token
          const receiverToken1 = valentine1.receiver_url.split('/v/')[1];
          await submitAnswerByReceiverToken(receiverToken1, 'yes');

          // Second Valentine should still be pending
          const receiverToken2 = valentine2.receiver_url.split('/v/')[1];
          const valentine2Data = await getValentineByReceiverToken(receiverToken2);
          expect(valentine2Data.status).toBe('pending');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 20: New instance per creation
   * For any Valentine creation request, a new unique Valentine instance
   * should be generated with a unique ID
   * **Validates: Requirements 10.1, 10.4**
   */
  it('Property 20: Each creation generates new instance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          // Create multiple Valentines with same data
          const valentine1 = await createValentine(senderName, receiverName);
          const valentine2 = await createValentine(senderName, receiverName);

          // Should have different IDs and different URLs
          expect(valentine1.valentine_id).not.toBe(valentine2.valentine_id);
          expect(valentine1.sender_url).not.toBe(valentine2.sender_url);
          expect(valentine1.receiver_url).not.toBe(valentine2.receiver_url);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: Answer-Valentine association
   * For any submitted answer, it should be associated with exactly one Valentine instance
   * **Validates: Requirements 10.5**
   */
  it('Property 21: Answers are associated with correct Valentine', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom('yes', 'no'),
        async (receiverName, answer) => {
          // Create a valentine first
          const created = await createValentine(null, receiverName);

          const receiverToken = created.receiver_url.split('/v/')[1];
          await submitAnswerByReceiverToken(receiverToken, answer);

          // Answer should be retrievable for this Valentine
          const valentine = await getValentineByReceiverToken(receiverToken);
          expect(valentine.status).toBe(answer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 22: Valentine persistence
   * For any created Valentine, a corresponding record should exist in the database
   * with all provided data
   * **Validates: Requirements 14.1**
   */
  it('Property 22: Valentines are persisted correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const created = await createValentine(senderName, receiverName);

          // Should be retrievable by receiver token
          const receiverToken = created.receiver_url.split('/v/')[1];
          const retrieved = await getValentineByReceiverToken(receiverToken);
          expect(retrieved.receiver_name).toBe(receiverName.trim());
          expect(retrieved.sender_name).toBe(senderName?.trim() || null);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 23: Answer persistence
   * For any submitted answer, the database should be updated with the answer status
   * **Validates: Requirements 14.2**
   */
  it('Property 23: Answers are persisted correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom('yes', 'no'),
        async (receiverName, answer) => {
          // Create a valentine first
          const created = await createValentine(null, receiverName);

          const receiverToken = created.receiver_url.split('/v/')[1];
          const result = await submitAnswerByReceiverToken(receiverToken, answer);

          // Should succeed
          expect(result.success).toBe(true);

          // Status should be updated
          const valentine = await getValentineByReceiverToken(receiverToken);
          expect(valentine.status).toBe(answer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 25: Valentine-answer referential integrity
   * **Validates: Requirements 14.4**
   */
  it('Property 25: Valentine-answer referential integrity is maintained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom('yes', 'no'),
        async (receiverName, answer) => {
          const created = await createValentine(null, receiverName);
          const receiverToken = created.receiver_url.split('/v/')[1];
          await submitAnswerByReceiverToken(receiverToken, answer);

          const valentine = await getValentineByReceiverToken(receiverToken);
          expect(valentine.status).toBe(answer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26: Token-Valentine referential integrity
   * For any created Valentine, both sender_token and receiver_token should be valid UUIDs
   * **Validates: Requirements 14.5**
   */
  it('Property 26: Token-Valentine referential integrity is maintained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (receiverName) => {
          const created = await createValentine(null, receiverName);

          // Sender token should be in sender URL
          const senderToken = created.sender_url.split('/r/')[1];
          expect(senderToken).toBeTruthy();
          expect(senderToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

          // Receiver token should be in receiver URL
          const receiverToken = created.receiver_url.split('/v/')[1];
          expect(receiverToken).toBeTruthy();
          expect(receiverToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});
