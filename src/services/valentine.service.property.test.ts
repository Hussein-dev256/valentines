/**
 * Property-Based Tests for ValentineService
 * 
 * Feature: will-you-be-my-valentine
 * 
 * These tests use fast-check to verify universal properties across many inputs.
 * Each property test runs 20 iterations with randomized inputs for optimized speed.
 * 
 * Properties tested:
 * - Property 3: Valentine ID uniqueness
 * - Property 4: Result token uniqueness
 * - Property 5: Valentine URL format consistency
 * - Property 6: Result URL format consistency
 * - Property 7: One-to-one Valentine-token relationship
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
              senderName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
              receiverName: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (valentineRequests) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Track all generated valentine IDs
            const generatedIds = new Set<string>();
            const actualIds: string[] = [];

            // Mock crypto.randomUUID to track generated IDs
            let idCounter = 0;
            vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
              const id = `${idCounter % 2 === 0 ? 'valentine' : 'token'}-${crypto.randomUUID()}`;
              if (idCounter % 2 === 0) {
                actualIds.push(id);
              }
              idCounter++;
              return id as `${string}-${string}-${string}-${string}-${string}`;
            });

            // Create all Valentines
            const results = await Promise.all(
              valentineRequests.map(req => 
                createValentine(req.senderName, req.receiverName)
              )
            );

            // Extract valentine IDs from results
            const valentineIds = results.map(r => r.valentine_id);

            // Add all IDs to set
            valentineIds.forEach(id => generatedIds.add(id));

            // Property: All valentine IDs must be unique (set size equals array length)
            expect(generatedIds.size).toBe(valentineIds.length);

            // Additional check: No duplicate IDs in the array
            const hasDuplicates = valentineIds.length !== new Set(valentineIds).size;
            expect(hasDuplicates).toBe(false);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 4: Result token uniqueness', () => {
    it('should generate globally unique result_token values for any set of created Valentines', async () => {
      /**
       * **Validates: Requirements 2.6, 3.4**
       * 
       * For any set of created Valentines, all result_token values should be 
       * globally unique with no duplicates.
       */
      
      await fc.assert(
        fc.asyncProperty(
          // Generate an array of 5-20 Valentine creation requests
          fc.array(
            fc.record({
              senderName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
              receiverName: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (valentineRequests) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Track all generated result tokens
            const generatedTokens = new Set<string>();

            // Mock crypto.randomUUID to track generated tokens
            let idCounter = 0;
            const tokens: string[] = [];
            vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
              const id = `${idCounter % 2 === 0 ? 'valentine' : 'token'}-${crypto.randomUUID()}`;
              if (idCounter % 2 === 1) {
                tokens.push(id);
              }
              idCounter++;
              return id as `${string}-${string}-${string}-${string}-${string}`;
            });

            // Create all Valentines
            const results = await Promise.all(
              valentineRequests.map(req => 
                createValentine(req.senderName, req.receiverName)
              )
            );

            // Extract result tokens from URLs
            const resultTokens = results.map(r => {
              const match = r.result_url.match(/\/r\/(.+)$/);
              return match ? match[1] : '';
            });

            // Add all tokens to set
            resultTokens.forEach(token => generatedTokens.add(token));

            // Property: All result tokens must be unique (set size equals array length)
            expect(generatedTokens.size).toBe(resultTokens.length);

            // Additional check: No duplicate tokens in the array
            const hasDuplicates = resultTokens.length !== new Set(resultTokens).size;
            expect(hasDuplicates).toBe(false);
          }
        ),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 5: Valentine URL format consistency', () => {
    it('should generate Valentine links matching /v/{valentine_id} format with valid UUID', async () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * For any created Valentine, the generated Valentine link should match 
       * the format /v/{valentine_id} where valentine_id is a valid UUID.
       */
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            senderName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
            receiverName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (valentineRequest) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Mock crypto.randomUUID to return real UUIDs
            vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
              return crypto.randomUUID();
            });

            // Create Valentine
            const result = await createValentine(
              valentineRequest.senderName,
              valentineRequest.receiverName
            );

            // Property 1: URL should start with base URL + /v/
            expect(result.public_url).toMatch(/^http:\/\/localhost:3000\/v\//);

            // Property 2: Extract the valentine_id from URL
            const urlMatch = result.public_url.match(/\/v\/(.+)$/);
            expect(urlMatch).not.toBeNull();
            
            if (urlMatch) {
              const valentineIdFromUrl = urlMatch[1];
              
              // Property 3: The valentine_id in URL should be a valid UUID
              expect(valentineIdFromUrl).toMatch(UUID_REGEX);
              
              // Property 4: The valentine_id in URL should match the returned valentine_id
              expect(valentineIdFromUrl).toBe(result.valentine_id);
              
              // Property 5: The valentine_id should also be a valid UUID
              expect(result.valentine_id).toMatch(UUID_REGEX);
            }
          }
        ),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 6: Result URL format consistency', () => {
    it('should generate result links matching /r/{result_token} format with valid UUID', async () => {
      /**
       * **Validates: Requirements 3.2**
       * 
       * For any created Valentine, the generated result link should match 
       * the format /r/{result_token} where result_token is a valid UUID.
       */
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            senderName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
            receiverName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (valentineRequest) => {
            // Set up mock for successful creation
            createMockSupabaseSuccess();

            // Mock crypto.randomUUID to return real UUIDs
            vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
              return crypto.randomUUID();
            });

            // Create Valentine
            const result = await createValentine(
              valentineRequest.senderName,
              valentineRequest.receiverName
            );

            // Property 1: URL should start with base URL + /r/
            expect(result.result_url).toMatch(/^http:\/\/localhost:3000\/r\//);

            // Property 2: Extract the result_token from URL
            const urlMatch = result.result_url.match(/\/r\/(.+)$/);
            expect(urlMatch).not.toBeNull();
            
            if (urlMatch) {
              const resultTokenFromUrl = urlMatch[1];
              
              // Property 3: The result_token in URL should be a valid UUID
              expect(resultTokenFromUrl).toMatch(UUID_REGEX);
            }
          }
        ),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 7: One-to-one Valentine-token relationship', () => {
    it('should associate exactly one result token with each Valentine instance', async () => {
      /**
       * **Validates: Requirements 3.5**
       * 
       * For any created Valentine instance, exactly one result token should be 
       * associated with it, and that token should not be associated with any 
       * other Valentine.
       */
      
      await fc.assert(
        fc.asyncProperty(
          // Generate an array of 5-15 Valentine creation requests
          fc.array(
            fc.record({
              senderName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
              receiverName: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 5, maxLength: 15 }
          ),
          async (valentineRequests) => {
            // Set up mock for successful creation
            const { mockInsert } = createMockSupabaseSuccess();

            // Mock crypto.randomUUID to return real UUIDs
            vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
              return crypto.randomUUID();
            });

            // Create all Valentines
            const results = await Promise.all(
              valentineRequests.map(req => 
                createValentine(req.senderName, req.receiverName)
              )
            );

            // Extract valentine IDs and result tokens
            const valentineIds = results.map(r => r.valentine_id);
            const resultTokens = results.map(r => {
              const match = r.result_url.match(/\/r\/(.+)$/);
              return match ? match[1] : '';
            });

            // Property 1: Each Valentine should have exactly one result token
            expect(valentineIds.length).toBe(resultTokens.length);

            // Property 2: All result tokens should be unique (no token shared between Valentines)
            const uniqueTokens = new Set(resultTokens);
            expect(uniqueTokens.size).toBe(resultTokens.length);

            // Property 3: Verify the database inserts maintain the one-to-one relationship
            // Check that result_tokens table was called with correct valentine_id associations
            const tokenInsertCalls = mockInsert.mock.calls.filter(
              call => call[0].token !== undefined
            );

            expect(tokenInsertCalls.length).toBe(valentineIds.length);

            // Property 4: Each token insert should reference a unique valentine_id
            const tokenToValentineMap = new Map<string, string>();
            tokenInsertCalls.forEach(call => {
              const token = call[0].token;
              const valentineId = call[0].valentine_id;
              
              // Ensure this token hasn't been associated with another Valentine
              expect(tokenToValentineMap.has(token)).toBe(false);
              
              tokenToValentineMap.set(token, valentineId);
            });

            // Property 5: Each valentine_id should appear exactly once in token associations
            const valentineIdCounts = new Map<string, number>();
            tokenInsertCalls.forEach(call => {
              const valentineId = call[0].valentine_id;
              valentineIdCounts.set(valentineId, (valentineIdCounts.get(valentineId) || 0) + 1);
            });

            valentineIds.forEach(id => {
              expect(valentineIdCounts.get(id)).toBe(1);
            });
          }
        ),
        { numRuns: 25 }
      );
    });
  });
});
