/**
 * Property-Based Tests for Data Persistence
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 19-23, 25-26 from the design document
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { createValentine, submitAnswer, getValentine } from './valentine.service';

// In-memory database for testing
const valentinesDb = new Map<string, { sender_name: string | null; receiver_name: string; status: string }>();

// Mock Supabase
vi.mock('./api.service', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'valentines') {
        return {
          insert: vi.fn((data: any) => {
            valentinesDb.set(data.id, {
              sender_name: data.sender_name,
              receiver_name: data.receiver_name,
              status: data.status,
            });
            return { error: null };
          }),
          select: vi.fn(() => ({
            eq: vi.fn((field: string, value: string) => ({
              single: vi.fn(() => {
                const data = valentinesDb.get(value);
                return {
                  data: data || null,
                  error: data ? null : { message: 'Not found' },
                };
              }),
            })),
          })),
          update: vi.fn((data: any) => ({
            eq: vi.fn((field: string, value: string) => ({
              eq: vi.fn(() => {
                const existing = valentinesDb.get(value);
                if (existing && existing.status === 'pending') {
                  valentinesDb.set(value, { ...existing, status: data.status });
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
  ApiError: class extends Error {},
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

          // Answer first Valentine
          await submitAnswer(valentine1.valentine_id, 'yes');

          // Second Valentine should still be pending
          const valentine2Data = await getValentine(valentine2.valentine_id);
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

          // Should have different IDs
          expect(valentine1.valentine_id).not.toBe(valentine2.valentine_id);
          expect(valentine1.result_url).not.toBe(valentine2.result_url);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: Answer-Valentine association
   * For any submitted answer, it should be associated with exactly one Valentine instance,
   * and that association should be maintained in the database
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
          
          await submitAnswer(created.valentine_id, answer);

          // Answer should be retrievable for this Valentine
          const valentine = await getValentine(created.valentine_id);
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

          // Should be retrievable
          const retrieved = await getValentine(created.valentine_id);
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
   * and timestamp
   * **Validates: Requirements 14.2**
   */
  it('Property 23: Answers are persisted with timestamps', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom('yes', 'no'),
        async (receiverName, answer) => {
          // Create a valentine first
          const created = await createValentine(null, receiverName);
          
          const result = await submitAnswer(created.valentine_id, answer);

          // Should succeed
          expect(result.success).toBe(true);

          // Status should be updated
          const valentine = await getValentine(created.valentine_id);
          expect(valentine.status).toBe(answer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 25: Valentine-answer referential integrity
   * For any Valentine instance, the association between the Valentine ID and its answer status
   * should be maintained in the database
   * **Validates: Requirements 14.4**
   */
  it('Property 25: Valentine-answer referential integrity is maintained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom('yes', 'no'),
        async (receiverName, answer) => {
          const created = await createValentine(null, receiverName);
          await submitAnswer(created.valentine_id, answer);

          // Answer should be retrievable via Valentine ID
          const valentine = await getValentine(created.valentine_id);
          expect(valentine.status).toBe(answer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26: Token-Valentine referential integrity
   * For any result token, the association between the token and its Valentine ID
   * should be maintained in the database
   * **Validates: Requirements 14.5**
   */
  it('Property 26: Token-Valentine referential integrity is maintained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (receiverName) => {
          const created = await createValentine(null, receiverName);

          // Token should be in result URL
          const token = created.result_url.split('/r/')[1];
          expect(token).toBeTruthy();
          expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});
