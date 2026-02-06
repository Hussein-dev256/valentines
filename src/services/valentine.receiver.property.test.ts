/**
 * Property-Based Tests for Receiver Page
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 1, 2, 9 from the design document
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { createValentine, getValentine } from './valentine.service';

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

describe('Receiver Page Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    valentinesDb.clear();
  });

  /**
   * Property 1: Non-empty receiver names are accepted
   * For any non-empty text string, when submitted as a receiver name,
   * the system should accept it and create a Valentine instance
   * **Validates: Requirements 2.2**
   */
  it('Property 1: Non-empty receiver names are accepted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (receiverName) => {
          const result = await createValentine(null, receiverName);

          // Should successfully create Valentine
          expect(result.valentine_id).toBeTruthy();
          expect(result.public_url).toBeTruthy();
          expect(result.result_url).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Sender name appears in Valentine when provided
   * For any non-empty sender name, when included in Valentine creation,
   * the sender name should appear in the Valentine message displayed to the receiver
   * **Validates: Requirements 2.3, 4.2**
   */
  it('Property 2: Sender name appears when provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (senderName, receiverName) => {
          const created = await createValentine(senderName, receiverName);
          const valentine = await getValentine(created.valentine_id);

          // Sender name should be present (trimmed)
          expect(valentine.sender_name).toBe(senderName.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Receiver name display
   * For any Valentine instance, when displayed to the receiver,
   * the receiver name should appear prominently in the question text
   * **Validates: Requirements 4.1**
   */
  it('Property 9: Receiver name is displayed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const created = await createValentine(senderName, receiverName);
          const valentine = await getValentine(created.valentine_id);

          // Receiver name should be present (trimmed)
          expect(valentine.receiver_name).toBe(receiverName.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});
