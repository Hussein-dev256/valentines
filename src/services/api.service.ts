/**
 * Base API service
 * 
 * This module provides common utilities and error handling
 * for all API services in the application.
 */

import { supabase } from '../lib/supabase';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode?: number;
  public originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, delayMs, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: unknown;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retrying
      await sleep(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }

  // All attempts failed
  throw new ApiError(
    'Request failed after multiple attempts',
    undefined,
    lastError
  );
}

/**
 * Handle Supabase errors and convert to ApiError
 */
export function handleSupabaseError(error: unknown): never {
  if (error && typeof error === 'object' && 'message' in error) {
    throw new ApiError(
      error.message as string,
      'code' in error ? Number(error.code) : undefined,
      error
    );
  }
  
  throw new ApiError('An unexpected error occurred', undefined, error);
}

/**
 * Export the Supabase client for use in services
 */
export { supabase };
