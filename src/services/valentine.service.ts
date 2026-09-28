/**
 * Valentine Service
 * 
 * This service handles all Valentine-related API operations using
 * dual-token role-based access control:
 * - sender_token: embedded in sender's results URL
 * - receiver_token: embedded in receiver's answering URL
 * 
 * The token in the URL determines the user's role. No localStorage
 * or client-side identity checks are needed for access control.
 */

import { supabase, withRetry, handleSupabaseError, ApiError } from './api.service';
import { generateSenderId, storeSenderMapping } from '../utils/senderIdentity';
import type {
  CreateValentineResponse,
  GetValentineByReceiverTokenResponse,
  GetValentineBySenderTokenResponse,
  SubmitAnswerResponse,
  ValentineStatus,
} from '../types/database.types';

/**
 * Create a new Valentine instance
 * 
 * Generates sender_token and receiver_token for role-based URL access.
 * 
 * @param senderName - Optional name of the person sending the Valentine
 * @param receiverName - Required name of the person receiving the Valentine
 * @returns Valentine ID and role-specific URLs
 */
export async function createValentine(
  senderName: string | null,
  receiverName: string
): Promise<CreateValentineResponse> {
  if (!receiverName || !receiverName.trim() || receiverName.trim().length === 0) {
    throw new ApiError('Receiver name is required');
  }

  return withRetry(async () => {
    try {
      const valentineId = crypto.randomUUID();
      const senderToken = crypto.randomUUID();
      const receiverToken = crypto.randomUUID();
      const senderId = generateSenderId();

      // Insert Valentine record with both tokens
      const { error: valentineError } = await supabase
        .from('valentines')
        .insert({
          id: valentineId,
          sender_name: senderName?.trim() || null,
          receiver_name: receiverName.trim(),
          status: 'pending' as ValentineStatus,
          sender_id: senderId,
          sender_token: senderToken,
          receiver_token: receiverToken,
        });

      if (valentineError) {
        handleSupabaseError(valentineError);
      }

      // Also insert into result_tokens for backward compatibility
      const { error: tokenError } = await supabase
        .from('result_tokens')
        .insert({
          token: senderToken, // Use sender_token as the result_token for compat
          valentine_id: valentineId,
        });

      if (tokenError) {
        handleSupabaseError(tokenError);
      }

      // Generate role-specific URLs
      const baseUrl = window.location.origin;
      const receiverUrl = `${baseUrl}/v/${receiverToken}`;
      const senderUrl = `${baseUrl}/r/${senderToken}`;

      // Store sender mapping in localStorage (convenience for "My Valentines" page)
      storeSenderMapping(valentineId, senderId);

      return {
        valentine_id: valentineId,
        receiver_url: receiverUrl,
        sender_url: senderUrl,
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
 * Get Valentine data by receiver_token
 * This is what receivers see — only the answering interface data.
 * 
 * @param receiverToken - The receiver_token UUID from the URL
 * @returns Valentine data for the answering page
 */
export async function getValentineByReceiverToken(
  receiverToken: string
): Promise<GetValentineByReceiverTokenResponse> {
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('valentines')
        .select('id, sender_name, receiver_name, status')
        .eq('receiver_token', receiverToken)
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      if (!data) {
        throw new ApiError('Valentine not found', 404);
      }

      return {
        valentine_id: data.id,
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
 * Get Valentine data by sender_token
 * This is what senders see — the results page data.
 * 
 * @param senderToken - The sender_token UUID from the URL
 * @returns Valentine result data for the sender
 */
export async function getValentineBySenderToken(
  senderToken: string
): Promise<GetValentineBySenderTokenResponse> {
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('valentines')
        .select('id, sender_name, receiver_name, status, created_at, answered_at')
        .eq('sender_token', senderToken)
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      if (!data) {
        throw new ApiError('Valentine not found', 404);
      }

      return {
        valentine_id: data.id,
        sender_name: data.sender_name,
        receiver_name: data.receiver_name,
        status: data.status,
        created_at: data.created_at,
        answered_at: data.answered_at,
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
 * Submit an answer using receiver_token as authorization.
 * Only the holder of the receiver_token can submit an answer.
 * 
 * @param receiverToken - The receiver_token UUID from the URL
 * @param answer - The answer ('yes' or 'no')
 * @returns Success response
 */
export async function submitAnswerByReceiverToken(
  receiverToken: string,
  answer: 'yes' | 'no'
): Promise<SubmitAnswerResponse> {
  return withRetry(async () => {
    try {
      // First, check current status using receiver_token
      const { data: currentData, error: fetchError } = await supabase
        .from('valentines')
        .select('id, status')
        .eq('receiver_token', receiverToken)
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

      // Update using both receiver_token AND pending status as guards
      const { error: updateError } = await supabase
        .from('valentines')
        .update({
          status: answer,
          answered_at: new Date().toISOString(),
        })
        .eq('receiver_token', receiverToken)
        .eq('status', 'pending');

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
 * Lookup a valentine by its ID and return the receiver_token.
 * Used for backward compatibility with old-format links (/v/{valentine_id}).
 * 
 * @param valentineId - The valentine UUID
 * @returns The receiver_token, or null if not found
 */
export async function getReceiverTokenByValentineId(
  valentineId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('valentines')
      .select('receiver_token')
      .eq('id', valentineId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.receiver_token;
  } catch {
    return null;
  }
}
