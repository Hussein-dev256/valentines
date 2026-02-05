/**
 * Unit tests for ValentineService
 * 
 * Tests all Valentine-related API operations including:
 * - Creating new Valentines
 * - Retrieving Valentine data
 * - Submitting answers
 * - Retrieving results
 * - Error handling and retry logic
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createValentine,
  getValentine,
  submitAnswer,
  getResult,
} from './valentine.service';
import { supabase } from './api.service';

// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('ValentineService', () => {
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

  describe('createValentine', () => {
    it('should create a Valentine with sender and receiver names', async () => {
      const mockValentineId = 'test-valentine-id';
      const mockResultToken = 'test-result-token';
      
      // Mock crypto.randomUUID to return predictable values
      let callCount = 0;
      vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? mockValentineId : mockResultToken) as `${string}-${string}-${string}-${string}-${string}`;
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result = await createValentine('Alice', 'Bob');

      expect(result).toEqual({
        valentine_id: mockValentineId,
        public_url: `http://localhost:3000/v/${mockValentineId}`,
        result_url: `http://localhost:3000/r/${mockResultToken}`,
      });

      // Verify Valentine was inserted
      expect(mockFrom).toHaveBeenCalledWith('valentines');
      expect(mockInsert).toHaveBeenCalledWith({
        id: mockValentineId,
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'pending',
      });

      // Verify result token was inserted
      expect(mockFrom).toHaveBeenCalledWith('result_tokens');
      expect(mockInsert).toHaveBeenCalledWith({
        token: mockResultToken,
        valentine_id: mockValentineId,
      });
    });

    it('should create an anonymous Valentine when sender name is null', async () => {
      const mockValentineId = 'test-valentine-id';
      const mockResultToken = 'test-result-token';
      
      let callCount = 0;
      vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? mockValentineId : mockResultToken) as `${string}-${string}-${string}-${string}-${string}`;
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result = await createValentine(null, 'Bob');

      expect(result.valentine_id).toBe(mockValentineId);
      
      // Verify sender_name is null
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          sender_name: null,
          receiver_name: 'Bob',
        })
      );
    });

    it('should trim whitespace from names', async () => {
      const mockValentineId = 'test-valentine-id';
      const mockResultToken = 'test-result-token';
      
      let callCount = 0;
      vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? mockValentineId : mockResultToken) as `${string}-${string}-${string}-${string}-${string}`;
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      await createValentine('  Alice  ', '  Bob  ');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          sender_name: 'Alice',
          receiver_name: 'Bob',
        })
      );
    });

    it('should reject empty receiver name', async () => {
      await expect(createValentine('Alice', '')).rejects.toThrow(
        'Receiver name is required'
      );
      
      await expect(createValentine('Alice', '   ')).rejects.toThrow(
        'Receiver name is required'
      );
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      await expect(createValentine('Alice', 'Bob')).rejects.toThrow();
    });
  });

  describe('getValentine', () => {
    it('should retrieve Valentine data by ID', async () => {
      const mockData = {
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'pending',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      const result = await getValentine('test-id');

      expect(result).toEqual(mockData);
      expect(mockFrom).toHaveBeenCalledWith('valentines');
      expect(mockSelect).toHaveBeenCalledWith('sender_name, receiver_name, status');
      expect(mockEq).toHaveBeenCalledWith('id', 'test-id');
    });

    it('should handle Valentine not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      await expect(getValentine('invalid-id')).rejects.toThrow();
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      await expect(getValentine('test-id')).rejects.toThrow();
    });
  });

  describe('submitAnswer', () => {
    it('should submit YES answer successfully', async () => {
      // Mock the select query to return pending status
      const mockSingle = vi.fn().mockResolvedValue({
        data: { status: 'pending' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock the update query
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
      });

      const mockFrom = vi.fn((table: string) => {
        if (table === 'valentines') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        return {};
      });
      
      (supabase.from as any) = mockFrom;

      const result = await submitAnswer('test-id', 'yes');

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'yes',
          answered_at: expect.any(String),
        })
      );
    });

    it('should submit NO answer successfully', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { status: 'pending' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
      });

      const mockFrom = vi.fn((table: string) => {
        if (table === 'valentines') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        return {};
      });
      
      (supabase.from as any) = mockFrom;

      const result = await submitAnswer('test-id', 'no');

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'no',
          answered_at: expect.any(String),
        })
      );
    });

    it('should be idempotent when Valentine already answered', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { status: 'yes' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockUpdate = vi.fn();

      const mockFrom = vi.fn((table: string) => {
        if (table === 'valentines') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        return {};
      });
      
      (supabase.from as any) = mockFrom;

      const result = await submitAnswer('test-id', 'no');

      expect(result).toEqual({ success: true });
      // Update should not be called
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle Valentine not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      
      (supabase.from as any) = mockFrom;

      await expect(submitAnswer('invalid-id', 'yes')).rejects.toThrow();
    });
  });

  describe('getResult', () => {
    it('should retrieve result by token', async () => {
      const mockTokenData = { valentine_id: 'test-valentine-id' };
      const mockValentineData = {
        status: 'yes',
        created_at: '2024-01-01T00:00:00Z',
        answered_at: '2024-01-01T01:00:00Z',
      };

      const mockSingle = vi.fn()
        .mockResolvedValueOnce({
          data: mockTokenData,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockValentineData,
          error: null,
        });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      const result = await getResult('test-token');

      expect(result).toEqual(mockValentineData);
      expect(mockFrom).toHaveBeenCalledWith('result_tokens');
      expect(mockFrom).toHaveBeenCalledWith('valentines');
    });

    it('should handle invalid token', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      await expect(getResult('invalid-token')).rejects.toThrow();
    });

    it('should handle pending Valentine', async () => {
      const mockTokenData = { valentine_id: 'test-valentine-id' };
      const mockValentineData = {
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        answered_at: null,
      };

      const mockSingle = vi.fn()
        .mockResolvedValueOnce({
          data: mockTokenData,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockValentineData,
          error: null,
        });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      const result = await getResult('test-token');

      expect(result).toEqual(mockValentineData);
      expect(result.status).toBe('pending');
      expect(result.answered_at).toBeNull();
    });
  });

  describe('Error handling and retry logic', () => {
    it('should retry on transient failures', async () => {
      let attemptCount = 0;
      const mockSingle = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.resolve({
            data: null,
            error: { message: 'Network error', code: 'NETWORK_ERROR' },
          });
        }
        return Promise.resolve({
          data: {
            sender_name: 'Alice',
            receiver_name: 'Bob',
            status: 'pending',
          },
          error: null,
        });
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      const result = await getValentine('test-id');

      expect(result).toBeDefined();
      expect(attemptCount).toBeGreaterThan(1);
    });

    it('should fail after max retry attempts', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Persistent error', code: 'ERROR' },
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      
      (supabase.from as any) = mockFrom;

      await expect(getValentine('test-id')).rejects.toThrow();
    });
  });
});

