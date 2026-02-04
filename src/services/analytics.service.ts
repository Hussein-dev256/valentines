/**
 * Analytics Service
 * 
 * This service handles analytics event tracking for the application.
 * Events are tracked in a fire-and-forget manner to avoid blocking
 * user interactions.
 */

import { supabase } from './api.service';
import type { TrackEventResponse } from '../types/database.types';

/**
 * Event types tracked by the application
 */
export const EventTypes = {
  ORIGIN_VIEW: 'origin_view',
  VALENTINE_CREATED: 'valentine_created',
  RECEIVER_OPENED: 'receiver_opened',
  ANSWERED_YES: 'answered_yes',
  ANSWERED_NO: 'answered_no',
  RESULT_VIEWED: 'result_viewed',
  SHARE_TRIGGERED: 'share_triggered',
  SHARE_FALLBACK: 'share_fallback',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

/**
 * Track an analytics event
 * 
 * This function uses a fire-and-forget pattern - errors are logged
 * but do not throw to avoid disrupting user experience.
 * 
 * @param eventType - Type of event to track
 * @param valentineId - Optional Valentine ID associated with the event
 * @param metadata - Optional additional event data
 * @returns Promise that resolves when tracking is complete (or fails silently)
 */
export async function trackEvent(
  eventType: EventType | string,
  valentineId?: string,
  metadata?: Record<string, unknown>
): Promise<TrackEventResponse> {
  try {
    const { error } = await supabase
      .from('events')
      .insert({
        event_type: eventType,
        valentine_id: valentineId || null,
        metadata: metadata || null,
      });

    if (error) {
      console.error('Analytics tracking error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    // Log error but don't throw - analytics should never break the app
    console.error('Analytics tracking error:', error);
    return { success: false };
  }
}

/**
 * Track multiple events in batch
 * 
 * @param events - Array of events to track
 * @returns Promise that resolves when all tracking is complete
 */
export async function trackEvents(
  events: Array<{
    eventType: EventType | string;
    valentineId?: string;
    metadata?: Record<string, unknown>;
  }>
): Promise<TrackEventResponse> {
  try {
    const { error } = await supabase
      .from('events')
      .insert(
        events.map(event => ({
          event_type: event.eventType,
          valentine_id: event.valentineId || null,
          metadata: event.metadata || null,
        }))
      );

    if (error) {
      console.error('Batch analytics tracking error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Batch analytics tracking error:', error);
    return { success: false };
  }
}
