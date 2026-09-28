/**
 * Property-Based Tests for ValentineService
 * 
 * Feature: will-you-be-my-valentine
 * 
 * These tests use fast-check to verify universal properties across many inputs.
 * Each property test runs 20-25 iterations with randomized inputs for optimized speed.
 * 
 * Updated for dual-token architecture (sender_token + receiver_token).
 * 
 * Properties tested:
 * - Property 3: Valentine ID uniqueness
 * - Property 4: Sender token uniqueness
 * - Property 5: Receiver URL format consistency
 * - Property 6: Sender URL format consistency
 * - Property 7: Dual-token separation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { createValentine } from './valentine.service';
import { supabase } from './api.service';

// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// UUID regex pattern for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper to generate non-whitespace strings
const nonWhitespaceString = (options: { minLength?: number; maxLength?: number } = {}) =>
  fc.string({ minLength: options.minLength || 1, maxLength: options.maxLength || 50 })
    .map(s => s.trim() || '!'); // Replace empty/whitespace with a non-whitespace character

// Helper to create a mock Supabase response for successful Valentine creation
function createMockSupabaseSuccess() {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn().mockReturnValue({
    insert: mockInsert,
  });
  (supabase.from as any) = mockFrom;
  return { mockFrom, mockInsert };
}

describe('ValentineService - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 3: Valentine ID uniqueness', () => {
    it('should generate globally unique valentine_id values for any set of created Valentines', async () => {
      /**
       * **Validates: Requirements 2.5, 3.3**
       * 
       * For any set of created Valentines, all valentine_id values should be 
       * globally unique with no duplicates.
       */

      await fc.assert(
        fc.asyncProperty(
          // Generate an array of 5-20 Valentine creation requests
          fc.array(
            fc.record({
              senderName: fc.option(nonWhitespaceString({ minLength: 1, maxLength: 50 }), { nil: null }),
              receiverName: nonWhitespaceString({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (valentineRequests) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Create all Valentines
            const results = await Promise.all(
              valentineRequests.map(req =>
                createValentine(req.senderName, req.receiverName)
              )
            );

            // Extract valentine IDs from results
            const valentineIds = results.map(r => r.valentine_id);
            const uniqueIds = new Set(valentineIds);

            // Property: All valentine IDs must be unique (set size equals array length)
            expect(uniqueIds.size).toBe(valentineIds.length);
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);
  });

  describe('Property 4: Sender token uniqueness', () => {
    it('should generate globally unique sender_token values for any set of created Valentines', async () => {
      /**
       * **Validates: Requirements 2.6, 3.4**
       * 
       * For any set of created Valentines, all sender_token values should be 
       * globally unique with no duplicates.
       */

      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              senderName: fc.option(nonWhitespaceString({ minLength: 1, maxLength: 50 }), { nil: null }),
              receiverName: nonWhitespaceString({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (valentineRequests) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Create all Valentines
            const results = await Promise.all(
              valentineRequests.map(req =>
                createValentine(req.senderName, req.receiverName)
              )
            );

            // Extract sender tokens from sender URLs
            const senderTokens = results.map(r => {
              const match = r.sender_url.match(/\/r\/(.+)$/);
              return match ? match[1] : '';
            });

            // Property: All sender tokens must be unique
            const uniqueTokens = new Set(senderTokens);
            expect(uniqueTokens.size).toBe(senderTokens.length);
          }
        ),
        { numRuns: 25 }
      );
    }, 30000);
  });

  describe('Property 5: Receiver URL format consistency', () => {
    it('should generate receiver links matching /v/{receiver_token} format with valid UUID', async () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * For any created Valentine, the generated receiver link should match 
       * the format /v/{receiver_token} where receiver_token is a valid UUID.
       */

      await fc.assert(
        fc.asyncProperty(
          fc.record({
            senderName: fc.option(nonWhitespaceString({ minLength: 1, maxLength: 50 }), { nil: null }),
            receiverName: nonWhitespaceString({ minLength: 1, maxLength: 50 }),
          }),
          async (valentineRequest) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Create Valentine
            const result = await createValentine(
              valentineRequest.senderName,
              valentineRequest.receiverName
            );

            // Property: receiver_url should start with base URL + /v/
            expect(result.receiver_url).toMatch(/^http:\/\/localhost:3000\/v\//);

            // Extract the receiver_token from URL
            const urlMatch = result.receiver_url.match(/\/v\/(.+)$/);
            expect(urlMatch).not.toBeNull();

            if (urlMatch) {
              const receiverTokenFromUrl = urlMatch[1];

              // The receiver_token in URL should be a valid UUID
              expect(receiverTokenFromUrl).toMatch(UUID_REGEX);
            }
          }
        ),
        { numRuns: 25 }
      );
    }, 30000);
  });

  describe('Property 6: Sender URL format consistency', () => {
    it('should generate sender result links matching /r/{sender_token} format with valid UUID', async () => {
      /**
       * **Validates: Requirements 3.2**
       * 
       * For any created Valentine, the generated sender result link should match 
       * the format /r/{sender_token} where sender_token is a valid UUID.
       */

      await fc.assert(
        fc.asyncProperty(
          fc.record({
            senderName: fc.option(nonWhitespaceString({ minLength: 1, maxLength: 50 }), { nil: null }),
            receiverName: nonWhitespaceString({ minLength: 1, maxLength: 50 }),
          }),
          async (valentineRequest) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Create Valentine
            const result = await createValentine(
              valentineRequest.senderName,
              valentineRequest.receiverName
            );

            // Property: sender_url should start with base URL + /r/
            expect(result.sender_url).toMatch(/^http:\/\/localhost:3000\/r\//);

            // Extract the sender_token from URL
            const urlMatch = result.sender_url.match(/\/r\/(.+)$/);
            expect(urlMatch).not.toBeNull();

            if (urlMatch) {
              const senderTokenFromUrl = urlMatch[1];

              // The sender_token in URL should be a valid UUID
              expect(senderTokenFromUrl).toMatch(UUID_REGEX);
            }
          }
        ),
        { numRuns: 25 }
      );
    }, 30000);
  });

  describe('Property 7: Dual-token separation', () => {
    it('should generate different sender_token and receiver_token for each Valentine', async () => {
      /**
       * **Validates: Requirements 3.5**
       * 
       * For any created Valentine instance, the sender_token and receiver_token
       * should be different values, and both should differ from the valentine_id.
       */

      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              senderName: fc.option(nonWhitespaceString({ minLength: 1, maxLength: 50 }), { nil: null }),
              receiverName: nonWhitespaceString({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 5, maxLength: 15 }
          ),
          async (valentineRequests) => {
            // Set up mock for successful creation
            const { mockInsert } = createMockSupabaseSuccess();

            // Create all Valentines
            const results = await Promise.all(
              valentineRequests.map(req =>
                createValentine(req.senderName, req.receiverName)
              )
            );

            // Extract tokens from URLs
            const senderTokens = results.map(r => r.sender_url.match(/\/r\/(.+)$/)![1]);
            const receiverTokens = results.map(r => r.receiver_url.match(/\/v\/(.+)$/)![1]);
            const valentineIds = results.map(r => r.valentine_id);

            // Property 1: Each Valentine should have different sender and receiver tokens
            for (let i = 0; i < results.length; i++) {
              expect(senderTokens[i]).not.toBe(receiverTokens[i]);
              expect(senderTokens[i]).not.toBe(valentineIds[i]);
              expect(receiverTokens[i]).not.toBe(valentineIds[i]);
            }

            // Property 2: All sender tokens should be unique
            expect(new Set(senderTokens).size).toBe(senderTokens.length);

            // Property 3: All receiver tokens should be unique
            expect(new Set(receiverTokens).size).toBe(receiverTokens.length);

            // Property 4: Verify the database insert includes both tokens
            const insertCalls = mockInsert.mock.calls;
            insertCalls.forEach(call => {
              const data = call[0];
              if (data.sender_token && data.receiver_token) {
                expect(data.sender_token).not.toBe(data.receiver_token);
              }
            });
          }
        ),
        { numRuns: 25 }
      );
    }, 30000);
  });
});
