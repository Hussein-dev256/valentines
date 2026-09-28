/**
 * Unit tests for ValentineService
 * 
 * Tests all Valentine-related API operations including:
 * - Creating new Valentines (with dual tokens)
 * - Retrieving Valentine data by receiver token
 * - Submitting answers by receiver token
 * - Retrieving results by sender token
 * - Error handling and retry logic
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createValentine,
  getValentineByReceiverToken,
  getValentineBySenderToken,
  submitAnswerByReceiverToken,
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
    it('should create a Valentine with sender and receiver names and dual tokens', async () => {
      const mockValentineId = 'test-valentine-id';
      const mockSenderToken = 'test-sender-token';
      const mockReceiverToken = 'test-receiver-token';

      // Mock crypto.randomUUID to return predictable values
      let callCount = 0;
      vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
        callCount++;
        const tokens = [mockValentineId, mockSenderToken, mockReceiverToken];
        return (tokens[callCount - 1] || 'extra') as `${string}-${string}-${string}-${string}-${string}`;
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any) = mockFrom;

      const result = await createValentine('Alice', 'Bob');

      expect(result).toEqual({
        valentine_id: mockValentineId,
        receiver_url: `http://localhost:3000/v/${mockReceiverToken}`,
        sender_url: `http://localhost:3000/r/${mockSenderToken}`,
      });

      // Verify Valentine was inserted with both tokens
      expect(mockFrom).toHaveBeenCalledWith('valentines');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockValentineId,
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'pending',
        sender_token: mockSenderToken,
        receiver_token: mockReceiverToken,
      }));
    });

    it('should create an anonymous Valentine when sender name is null', async () => {
      const mockValentineId = 'test-valentine-id';
      const mockSenderToken = 'test-sender-token';
      const mockReceiverToken = 'test-receiver-token';

      let callCount = 0;
      vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
        callCount++;
        const tokens = [mockValentineId, mockSenderToken, mockReceiverToken];
        return (tokens[callCount - 1] || 'extra') as `${string}-${string}-${string}-${string}-${string}`;
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
      let callCount = 0;
      vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
        callCount++;
        return `uuid-${callCount}` as `${string}-${string}-${string}-${string}-${string}`;
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

  describe('getValentineByReceiverToken', () => {
    it('should retrieve Valentine data by receiver token', async () => {
      const mockData = {
        id: 'test-id',
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

      const result = await getValentineByReceiverToken('test-receiver-token');

      // Service transforms id → valentine_id
      expect(result).toEqual({
        valentine_id: 'test-id',
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'pending',
      });
      expect(mockFrom).toHaveBeenCalledWith('valentines');
      expect(mockEq).toHaveBeenCalledWith('receiver_token', 'test-receiver-token');
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

      await expect(getValentineByReceiverToken('invalid-token')).rejects.toThrow();
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

      await expect(getValentineByReceiverToken('test-token')).rejects.toThrow();
    });
  });

  describe('submitAnswerByReceiverToken', () => {
    it('should submit YES answer successfully', async () => {
      // Mock the select query to return pending valentine
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'test-id', status: 'pending' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock the update query: .eq('receiver_token', ...).eq('status', 'pending')
      const mockUpdateEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockUpdateEq1 = vi.fn().mockReturnValue({ eq: mockUpdateEq2 });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockUpdateEq1,
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

      const result = await submitAnswerByReceiverToken('test-receiver-token', 'yes');

      expect(result).toEqual({ success: true });
    });

    it('should submit NO answer successfully', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'test-id', status: 'pending' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock the update query: .eq('receiver_token', ...).eq('status', 'pending')
      const mockUpdateEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockUpdateEq1 = vi.fn().mockReturnValue({ eq: mockUpdateEq2 });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockUpdateEq1,
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

      const result = await submitAnswerByReceiverToken('test-receiver-token', 'no');

      expect(result).toEqual({ success: true });
    });

    it('should be idempotent when Valentine already answered', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'test-id', status: 'yes' },
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

      const result = await submitAnswerByReceiverToken('test-receiver-token', 'no');

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

      await expect(submitAnswerByReceiverToken('invalid-token', 'yes')).rejects.toThrow();
    });
  });

  describe('getValentineBySenderToken', () => {
    it('should retrieve result by sender token', async () => {
      const mockData = {
        id: 'test-id',
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'yes',
        created_at: '2024-01-01T00:00:00Z',
        answered_at: '2024-01-01T01:00:00Z',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any) = mockFrom;

      const result = await getValentineBySenderToken('test-sender-token');

      // Service transforms id → valentine_id
      expect(result).toEqual({
        valentine_id: 'test-id',
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'yes',
        created_at: '2024-01-01T00:00:00Z',
        answered_at: '2024-01-01T01:00:00Z',
      });
      expect(mockFrom).toHaveBeenCalledWith('valentines');
      expect(mockEq).toHaveBeenCalledWith('sender_token', 'test-sender-token');
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

      await expect(getValentineBySenderToken('invalid-token')).rejects.toThrow();
    });

    it('should handle pending Valentine', async () => {
      const mockData = {
        id: 'test-id',
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        answered_at: null,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any) = mockFrom;

      const result = await getValentineBySenderToken('test-token');

      // Service transforms id → valentine_id
      expect(result).toEqual({
        valentine_id: 'test-id',
        sender_name: 'Alice',
        receiver_name: 'Bob',
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        answered_at: null,
      });
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
            id: 'test-id',
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

      const result = await getValentineByReceiverToken('test-token');

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

      await expect(getValentineByReceiverToken('test-token')).rejects.toThrow();
    });
  });
});
