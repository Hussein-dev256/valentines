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
import { generateSenderId, storeSenderMapping, getSenderIdForValentine } from '../utils/senderIdentity';
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
  if (!receiverName || !receiverName.trim() || receiverName.trim().length === 0) {
    throw new ApiError('Receiver name is required');
  }

  return withRetry(async () => {
    try {
      // Generate UUIDs for valentine, result token, and sender
      const valentineId = crypto.randomUUID();
      const resultToken = crypto.randomUUID();
      // CRITICAL: Generate a NEW unique sender_id for THIS valentine
      // Each valentine gets its own sender_id, not shared across valentines
      const senderId = generateSenderId();

      // Insert Valentine record with sender_id
      const { error: valentineError } = await supabase
        .from('valentines')
        .insert({
          id: valentineId,
          sender_name: senderName?.trim() || null,
          receiver_name: receiverName.trim(),
          status: 'pending' as ValentineStatus,
          sender_id: senderId, // Store sender ID for validation
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

      // Store sender mapping in localStorage for validation
      storeSenderMapping(valentineId, senderId);

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
 * @returns Valentine data including sender name, receiver name, status, and sender_id
 */
export async function getValentine(id: string): Promise<GetValentineResponse> {
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('valentines')
        .select('sender_name, receiver_name, status, sender_id')
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
        sender_id: data.sender_id,
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
 * @returns Result data including status, timestamps, and sender_id
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

      // Then, get the Valentine data including sender_id
      const { data: valentineData, error: valentineError } = await supabase
        .from('valentines')
        .select('status, created_at, answered_at, sender_id')
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
        sender_id: valentineData.sender_id,
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
 * Validate if the current user is the sender of a Valentine
 * 
 * @param valentineId - Valentine ID (UUID)
 * @returns true if current user is the sender, false otherwise
 */
export async function validateSenderAccess(valentineId: string): Promise<boolean> {
  try {
    // Get the sender ID for THIS specific valentine from localStorage
    const localSenderId = getSenderIdForValentine(valentineId);
    
    console.log('[validateSenderAccess] Valentine ID:', valentineId);
    console.log('[validateSenderAccess] Local sender ID for this valentine:', localSenderId);
    
    // If no local sender ID for this valentine, user is not the sender
    if (!localSenderId) {
      console.log('[validateSenderAccess] No local sender ID for this valentine, user is NOT sender');
      return false;
    }

    // Fetch valentine's sender_id from database
    const { data, error } = await supabase
      .from('valentines')
      .select('sender_id')
      .eq('id', valentineId)
      .single();

    if (error || !data) {
      console.log('[validateSenderAccess] Error fetching valentine or no data:', error);
      return false;
    }

    console.log('[validateSenderAccess] Valentine sender ID from DB:', data.sender_id);
    console.log('[validateSenderAccess] Match?', data.sender_id === localSenderId);

    // Compare local sender ID with database sender ID
    return data.sender_id === localSenderId;
  } catch (error) {
    console.error('Error validating sender access:', error);
    return false;
  }
}

/**
 * Validate if the current user is the sender for a result token
 * 
 * @param resultToken - Result token (UUID)
 * @returns true if current user is the sender, false otherwise
 */
export async function validateSenderAccessByToken(resultToken: string): Promise<boolean> {
  try {
    // Get valentine_id from result token first
    const { data: tokenData, error: tokenError } = await supabase
      .from('result_tokens')
      .select('valentine_id')
      .eq('token', resultToken)
      .single();

    if (tokenError || !tokenData) {
      return false;
    }

    // Get the sender ID for THIS specific valentine from localStorage
    const localSenderId = getSenderIdForValentine(tokenData.valentine_id);
    
    // If no local sender ID for this valentine, user is not the sender
    if (!localSenderId) {
      return false;
    }

    // Fetch valentine's sender_id from database
    const { data: valentineData, error: valentineError } = await supabase
      .from('valentines')
      .select('sender_id')
      .eq('id', tokenData.valentine_id)
      .single();

    if (valentineError || !valentineData) {
      return false;
    }

    // Compare local sender ID with database sender ID
    return valentineData.sender_id === localSenderId;
  } catch (error) {
    console.error('Error validating sender access by token:', error);
    return false;
  }
}

/**
 * Get result token by valentine ID from database
 * This allows sender to access results even without localStorage
 * 
 * @param valentineId - Valentine ID (UUID)
 * @returns Result token or null if not found
 */
export async function getResultTokenFromDatabase(valentineId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('result_tokens')
      .select('token')
      .eq('valentine_id', valentineId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.token;
  } catch (error) {
    console.error('Error fetching result token from database:', error);
    return null;
  }
}
