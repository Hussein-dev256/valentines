/**
 * Valentine Service
 * 
 * This service handles all Valentine-related API operations including:
 * - Creating new Valentines
 * - Retrieving Valentine data
 * - Submitting answers
 * - Retrieving results
 */

import { supabase, withRetry, handleSupabaseError, ApiError } from './api.service';
import type {
  CreateValentineResponse,
  GetValentineResponse,
  SubmitAnswerResponse,
  GetResultResponse,
  ValentineStatus,
} from '../types/database.types';

/**
 * Create a new Valentine instance
 * 
 * @param senderName - Optional name of the person sending the Valentine
 * @param receiverName - Required name of the person receiving the Valentine
 * @returns Valentine ID and URLs for sharing and viewing results
 */
export async function createValentine(
  senderName: string | null,
  receiverName: string
): Promise<CreateValentineResponse> {
  // Validate receiver name
  if (!receiverName || receiverName.trim().length === 0) {
    throw new ApiError('Receiver name is required');
  }

  return withRetry(async () => {
    try {
      // Generate UUIDs for valentine and result token
      const valentineId = crypto.randomUUID();
      const resultToken = crypto.randomUUID();

      // Insert Valentine record
      const { error: valentineError } = await supabase
        .from('valentines')
        .insert({
          id: valentineId,
          sender_name: senderName?.trim() || null,
          receiver_name: receiverName.trim(),
          status: 'pending' as ValentineStatus,
        });

      if (valentineError) {
        handleSupabaseError(valentineError);
      }

      // Insert result token record
      const { error: tokenError } = await supabase
        .from('result_tokens')
        .insert({
          token: resultToken,
          valentine_id: valentineId,
        });

      if (tokenError) {
        handleSupabaseError(tokenError);
      }

      // Generate URLs
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/v/${valentineId}`;
      const resultUrl = `${baseUrl}/r/${resultToken}`;

      return {
        valentine_id: valentineId,
        public_url: publicUrl,
        result_url: resultUrl,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      handleSupabaseError(error);
    }
  });
}

/**
 * Get Valentine data by ID
 * 
 * @param id - Valentine ID (UUID)
 * @returns Valentine data including sender name, receiver name, and status
 */
export async function getValentine(id: string): Promise<GetValentineResponse> {
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('valentines')
        .select('sender_name, receiver_name, status')
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      if (!data) {
        throw new ApiError('Valentine not found', 404);
      }

      return {
        sender_name: data.sender_name,
        receiver_name: data.receiver_name,
        status: data.status,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      handleSupabaseError(error);
    }
  });
}

/**
 * Submit an answer to a Valentine
 * 
 * @param id - Valentine ID (UUID)
 * @param answer - The answer ('yes' or 'no')
 * @returns Success response
 */
export async function submitAnswer(
  id: string,
  answer: 'yes' | 'no'
): Promise<SubmitAnswerResponse> {
  return withRetry(async () => {
    try {
      // First, check current status
      const { data: currentData, error: fetchError } = await supabase
        .from('valentines')
        .select('status')
        .eq('id', id)
        .single();

      if (fetchError) {
        handleSupabaseError(fetchError);
      }

      if (!currentData) {
        throw new ApiError('Valentine not found', 404);
      }

      // If already answered, return idempotent success
      if (currentData.status !== 'pending') {
        return { success: true };
      }

      // Update the Valentine with the answer
      const { error: updateError } = await supabase
        .from('valentines')
        .update({
          status: answer,
          answered_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending'); // Only update if still pending

      if (updateError) {
        handleSupabaseError(updateError);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      handleSupabaseError(error);
    }
  });
}

/**
 * Get result by result token
 * 
 * @param token - Result token (UUID)
 * @returns Result data including status and timestamps
 */
export async function getResult(token: string): Promise<GetResultResponse> {
  return withRetry(async () => {
    try {
      // First, get the valentine_id from the result token
      const { data: tokenData, error: tokenError } = await supabase
        .from('result_tokens')
        .select('valentine_id')
        .eq('token', token)
        .single();

      if (tokenError) {
        handleSupabaseError(tokenError);
      }

      if (!tokenData) {
        throw new ApiError('Invalid result token', 404);
      }

      // Then, get the Valentine data
      const { data: valentineData, error: valentineError } = await supabase
        .from('valentines')
        .select('status, created_at, answered_at')
        .eq('id', tokenData.valentine_id)
        .single();

      if (valentineError) {
        handleSupabaseError(valentineError);
      }

      if (!valentineData) {
        throw new ApiError('Valentine not found', 404);
      }

      return {
        status: valentineData.status,
        created_at: valentineData.created_at,
        answered_at: valentineData.answered_at,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      handleSupabaseError(error);
    }
  });
}
