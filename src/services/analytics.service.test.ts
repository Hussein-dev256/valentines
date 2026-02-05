/**
 * Unit tests for AnalyticsService
 * 
 * Tests all analytics event tracking operations including:
 * - Single event tracking
 * - Batch event tracking
 * - Error handling (fire-and-forget pattern)
 * - All event types
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  trackEvent,
  trackEvents,
  EventTypes,
  type EventType,
} from './analytics.service';
import { supabase } from './api.service';

// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EventTypes', () => {
    it('should define all required event types', () => {
      expect(EventTypes.ORIGIN_VIEW).toBe('origin_view');
      expect(EventTypes.VALENTINE_CREATED).toBe('valentine_created');
      expect(EventTypes.RECEIVER_OPENED).toBe('receiver_opened');
      expect(EventTypes.ANSWERED_YES).toBe('answered_yes');
      expect(EventTypes.ANSWERED_NO).toBe('answered_no');
      expect(EventTypes.RESULT_VIEWED).toBe('result_viewed');
      expect(EventTypes.SHARE_TRIGGERED).toBe('share_triggered');
      expect(EventTypes.SHARE_FALLBACK).toBe('share_fallback');
    });
  });

  describe('trackEvent', () => {
    it('should track event with all parameters', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result = await trackEvent(
        EventTypes.VALENTINE_CREATED,
        'test-valentine-id',
        { source: 'web' }
      );

      expect(result).toEqual({ success: true });
      expect(mockFrom).toHaveBeenCalledWith('events');
      expect(mockInsert).toHaveBeenCalledWith({
        event_type: 'valentine_created',
        valentine_id: 'test-valentine-id',
        metadata: { source: 'web' },
      });
    });

    it('should track event without valentine_id', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result = await trackEvent(EventTypes.ORIGIN_VIEW);

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        event_type: 'origin_view',
        valentine_id: null,
        metadata: null,
      });
    });

    it('should track event without metadata', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result = await trackEvent(
        EventTypes.RECEIVER_OPENED,
        'test-valentine-id'
      );

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        event_type: 'receiver_opened',
        valentine_id: 'test-valentine-id',
        metadata: null,
      });
    });

    it('should track all event types', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      // Test each event type
      const eventTypes: EventType[] = [
        EventTypes.ORIGIN_VIEW,
        EventTypes.VALENTINE_CREATED,
        EventTypes.RECEIVER_OPENED,
        EventTypes.ANSWERED_YES,
        EventTypes.ANSWERED_NO,
        EventTypes.RESULT_VIEWED,
        EventTypes.SHARE_TRIGGERED,
        EventTypes.SHARE_FALLBACK,
      ];

      for (const eventType of eventTypes) {
        await trackEvent(eventType);
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            event_type: eventType,
          })
        );
      }

      expect(mockInsert).toHaveBeenCalledTimes(eventTypes.length);
    });

    it('should accept custom event type strings', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result = await trackEvent('custom_event_type');

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        event_type: 'custom_event_type',
        valentine_id: null,
        metadata: null,
      });
    });

    it('should handle database errors gracefully (fire-and-forget)', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      // Should not throw, but return failure
      const result = await trackEvent(EventTypes.ORIGIN_VIEW);

      expect(result).toEqual({ success: false });
      expect(console.error).toHaveBeenCalledWith(
        'Analytics tracking error:',
        mockError
      );
    });

    it('should handle exceptions gracefully (fire-and-forget)', async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error('Network error'));
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      // Should not throw, but return failure
      const result = await trackEvent(EventTypes.ORIGIN_VIEW);

      expect(result).toEqual({ success: false });
      expect(console.error).toHaveBeenCalledWith(
        'Analytics tracking error:',
        expect.any(Error)
      );
    });

    it('should handle complex metadata objects', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const complexMetadata = {
        user_agent: 'Mozilla/5.0',
        screen_size: { width: 1920, height: 1080 },
        timestamp: new Date().toISOString(),
        nested: {
          deep: {
            value: 'test',
          },
        },
      };

      const result = await trackEvent(
        EventTypes.VALENTINE_CREATED,
        'test-id',
        complexMetadata
      );

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        event_type: 'valentine_created',
        valentine_id: 'test-id',
        metadata: complexMetadata,
      });
    });
  });

  describe('trackEvents', () => {
    it('should track multiple events in batch', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const events = [
        {
          eventType: EventTypes.ORIGIN_VIEW,
        },
        {
          eventType: EventTypes.VALENTINE_CREATED,
          valentineId: 'test-id-1',
          metadata: { source: 'web' },
        },
        {
          eventType: EventTypes.RECEIVER_OPENED,
          valentineId: 'test-id-2',
        },
      ];

      const result = await trackEvents(events);

      expect(result).toEqual({ success: true });
      expect(mockFrom).toHaveBeenCalledWith('events');
      expect(mockInsert).toHaveBeenCalledWith([
        {
          event_type: 'origin_view',
          valentine_id: null,
          metadata: null,
        },
        {
          event_type: 'valentine_created',
          valentine_id: 'test-id-1',
          metadata: { source: 'web' },
        },
        {
          event_type: 'receiver_opened',
          valentine_id: 'test-id-2',
          metadata: null,
        },
      ]);
    });

    it('should handle empty events array', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result = await trackEvents([]);

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith([]);
    });

    it('should handle batch database errors gracefully', async () => {
      const mockError = { message: 'Batch insert error', code: '500' };
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const events = [
        { eventType: EventTypes.ORIGIN_VIEW },
        { eventType: EventTypes.VALENTINE_CREATED, valentineId: 'test-id' },
      ];

      const result = await trackEvents(events);

      expect(result).toEqual({ success: false });
      expect(console.error).toHaveBeenCalledWith(
        'Batch analytics tracking error:',
        mockError
      );
    });

    it('should handle batch exceptions gracefully', async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error('Network error'));
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const events = [
        { eventType: EventTypes.ORIGIN_VIEW },
      ];

      const result = await trackEvents(events);

      expect(result).toEqual({ success: false });
      expect(console.error).toHaveBeenCalledWith(
        'Batch analytics tracking error:',
        expect.any(Error)
      );
    });

    it('should handle large batch of events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      // Create 100 events
      const events = Array.from({ length: 100 }, (_, i) => ({
        eventType: EventTypes.ORIGIN_VIEW,
        valentineId: `test-id-${i}`,
        metadata: { index: i },
      }));

      const result = await trackEvents(events);

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            event_type: 'origin_view',
          }),
        ])
      );
      expect(mockInsert.mock.calls[0][0]).toHaveLength(100);
    });
  });

  describe('Fire-and-forget pattern', () => {
    it('should never throw errors from trackEvent', async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error('Fatal error'));
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      // Should not throw
      await expect(
        trackEvent(EventTypes.ORIGIN_VIEW)
      ).resolves.toEqual({ success: false });
    });

    it('should never throw errors from trackEvents', async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error('Fatal error'));
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      // Should not throw
      await expect(
        trackEvents([{ eventType: EventTypes.ORIGIN_VIEW }])
      ).resolves.toEqual({ success: false });
    });

    it('should log errors but continue execution', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: 'Test error' },
      });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const result1 = await trackEvent(EventTypes.ORIGIN_VIEW);
      const result2 = await trackEvent(EventTypes.VALENTINE_CREATED);

      expect(result1).toEqual({ success: false });
      expect(result2).toEqual({ success: false });
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should track Valentine creation flow events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const valentineId = 'test-valentine-id';

      // Track creation
      await trackEvent(EventTypes.VALENTINE_CREATED, valentineId);
      
      // Track share
      await trackEvent(EventTypes.SHARE_TRIGGERED, valentineId);

      expect(mockInsert).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenNthCalledWith(1, {
        event_type: 'valentine_created',
        valentine_id: valentineId,
        metadata: null,
      });
      expect(mockInsert).toHaveBeenNthCalledWith(2, {
        event_type: 'share_triggered',
        valentine_id: valentineId,
        metadata: null,
      });
    });

    it('should track answer flow events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const valentineId = 'test-valentine-id';

      // Track receiver opening
      await trackEvent(EventTypes.RECEIVER_OPENED, valentineId);
      
      // Track answer
      await trackEvent(EventTypes.ANSWERED_YES, valentineId);

      expect(mockInsert).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenNthCalledWith(1, {
        event_type: 'receiver_opened',
        valentine_id: valentineId,
        metadata: null,
      });
      expect(mockInsert).toHaveBeenNthCalledWith(2, {
        event_type: 'answered_yes',
        valentine_id: valentineId,
        metadata: null,
      });
    });

    it('should track result viewing events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabase.from as any) = mockFrom;

      const valentineId = 'test-valentine-id';

      await trackEvent(EventTypes.RESULT_VIEWED, valentineId, {
        result: 'yes',
        viewedAt: new Date().toISOString(),
      });

      expect(mockInsert).toHaveBeenCalledWith({
        event_type: 'result_viewed',
        valentine_id: valentineId,
        metadata: expect.objectContaining({
          result: 'yes',
        }),
      });
    });
  });
});
