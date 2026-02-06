/**
 * Property-Based Tests for Valentine Creation
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 3-7 from the design document
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
  ApiError: class extends Error {},
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
   * Property 4: Result token uniqueness
   * For any set of created Valentines, all result_token values should be globally unique
   * **Validates: Requirements 2.6, 3.4**
   */
  it('Property 4: Result tokens are globally unique', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.tuple(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null })), { minLength: 2, maxLength: 10 }),
        async (valentineData) => {
          const results = await Promise.all(
            valentineData.map(([receiverName, senderName]) =>
              createValentine(senderName, receiverName)
            )
          );

          // Extract tokens from result URLs
          const tokens = results.map(r => r.result_url.split('/r/')[1]);
          const uniqueTokens = new Set(tokens);

          // All tokens should be unique
          expect(uniqueTokens.size).toBe(tokens.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Valentine URL format consistency
   * For any created Valentine, the generated Valentine link should match the format /v/{valentine_id}
   * **Validates: Requirements 3.1**
   */
  it('Property 5: Valentine URLs follow consistent format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const result = await createValentine(senderName, receiverName);

          // URL should match format
          const urlPattern = /^https?:\/\/.+\/v\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          expect(result.public_url).toMatch(urlPattern);

          // Valentine ID should be extractable from URL
          const extractedId = result.public_url.split('/v/')[1];
          expect(extractedId).toBe(result.valentine_id);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Result URL format consistency
   * For any created Valentine, the generated result link should match the format /r/{result_token}
   * **Validates: Requirements 3.2**
   */
  it('Property 6: Result URLs follow consistent format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const result = await createValentine(senderName, receiverName);

          // URL should match format
          const urlPattern = /^https?:\/\/.+\/r\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          expect(result.result_url).toMatch(urlPattern);

          // Token should be extractable from URL
          const extractedToken = result.result_url.split('/r/')[1];
          expect(extractedToken).toBeTruthy();
          expect(extractedToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: One-to-one Valentine-token relationship
   * For any created Valentine instance, exactly one result token should be associated with it
   * **Validates: Requirements 3.5**
   */
  it('Property 7: One-to-one Valentine-token relationship', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.option(fc.string().filter(s => s.trim().length > 0), { nil: null }),
        async (receiverName, senderName) => {
          const result = await createValentine(senderName, receiverName);

          // Each Valentine should have exactly one result URL
          expect(result.result_url).toBeTruthy();
          
          // Valentine ID and result token should be different
          const valentineId = result.valentine_id;
          const resultToken = result.result_url.split('/r/')[1];
          expect(valentineId).not.toBe(resultToken);
        }
      ),
      { numRuns: 100 }
    );
  });
});
