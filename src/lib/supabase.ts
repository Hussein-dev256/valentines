/**
 * Supabase client configuration
 * 
 * This module initializes and exports the Supabase client instance
 * used throughout the application for database interactions.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please check your .env.local file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please check your .env.local file.'
  );
}

/**
 * Supabase client instance
 * 
 * This client is configured for the Valentine application.
 * Row Level Security (RLS) policies control data access.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No authentication required for this app
    autoRefreshToken: false,
  },
});
