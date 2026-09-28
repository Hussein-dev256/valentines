/**
 * Property-Based Tests for Valentine Creation
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 3-7 from the design document
 * Updated for dual-token architecture (sender_token + receiver_token)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { createValentine } from './valentine.service';

// Mock Supabase
vi.mock('./api.service', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => ({ data: null, error: null })) })) })),
    })),
  },
  withRetry: vi.fn((fn) => fn()),
  handleSupabaseError: vi.fn(),
  ApiError: class extends Error { },
}));

describe('Valentine Creation Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 3: Valentine ID uniqueness
   * For any set of created Valentines, all valentine_id values should be globally unique
   * **Validates: Requirements 2.5, 3.3**
   */
  it('Property 3: Valentine IDs are globally unique', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.tuple(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null })), { minLength: 2, maxLength: 10 }),
        async (valentineData) => {
          const results = await Promise.all(
            valentineData.map(([receiverName, senderName]) =>
              createValentine(senderName, receiverName)
            )
          );

          const valentineIds = results.map(r => r.valentine_id);
          const uniqueIds = new Set(valentineIds);

          // All IDs should be unique
          expect(uniqueIds.size).toBe(valentineIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Sender token uniqueness
   * For any set of created Valentines, all sender_token values should be globally unique
   * **Validates: Requirements 2.6, 3.4**
   */
  it('Property 4: Sender tokens are globally unique', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.tuple(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null })), { minLength: 2, maxLength: 10 }),
        async (valentineData) => {
          const results = await Promise.all(
            valentineData.map(([receiverName, senderName]) =>
              createValentine(senderName, receiverName)
            )
          );

          // Extract sender tokens from sender URLs
          const tokens = results.map(r => r.sender_url.split('/r/')[1]);
          const uniqueTokens = new Set(tokens);

          // All tokens should be unique
          expect(uniqueTokens.size).toBe(tokens.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Receiver URL format consistency
   * For any created Valentine, the receiver link should match the format /v/{receiver_token}
   * **Validates: Requirements 3.1**
   */
  it('Property 5: Receiver URLs follow consistent format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const result = await createValentine(senderName, receiverName);

          // URL should match format with UUID token
          const urlPattern = /^https?:\/\/.+\/v\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          expect(result.receiver_url).toMatch(urlPattern);

          // Token should be extractable from URL
          const extractedToken = result.receiver_url.split('/v/')[1];
          expect(extractedToken).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Sender URL format consistency
   * For any created Valentine, the sender result link should match the format /r/{sender_token}
   * **Validates: Requirements 3.2**
   */
  it('Property 6: Sender URLs follow consistent format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const result = await createValentine(senderName, receiverName);

          // URL should match format with UUID token
          const urlPattern = /^https?:\/\/.+\/r\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          expect(result.sender_url).toMatch(urlPattern);

          // Token should be extractable from URL
          const extractedToken = result.sender_url.split('/r/')[1];
          expect(extractedToken).toBeTruthy();
          expect(extractedToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Dual-token separation
   * For any created Valentine, sender_token and receiver_token should be different
   * **Validates: Requirements 3.5**
   */
  it('Property 7: Sender and receiver tokens are different', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const result = await createValentine(senderName, receiverName);

          // Sender URL and receiver URL should use different tokens
          const senderToken = result.sender_url.split('/r/')[1];
          const receiverToken = result.receiver_url.split('/v/')[1];
          expect(senderToken).not.toBe(receiverToken);
          expect(senderToken).not.toBe(result.valentine_id);
          expect(receiverToken).not.toBe(result.valentine_id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
