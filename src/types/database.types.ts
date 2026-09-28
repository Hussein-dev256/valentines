/**
 * Database schema types for the Valentine application
 * These types match the Supabase database schema
 */

export type ValentineStatus = 'pending' | 'yes' | 'no';

export interface Valentine {
  id: string; // UUID
  sender_name: string | null;
  receiver_name: string;
  status: ValentineStatus;
  sender_id: string | null; // UUID - anonymous sender identifier (legacy)
  sender_token: string; // UUID - token for sender results URL
  receiver_token: string; // UUID - token for receiver answering URL
  created_at: string; // ISO timestamp
  answered_at: string | null; // ISO timestamp
}

export interface ResultToken {
  token: string; // UUID
  valentine_id: string; // UUID
  created_at: string; // ISO timestamp
}

export interface AnalyticsEvent {
  id: string; // UUID
  event_type: string;
  valentine_id: string | null; // UUID
  metadata: Record<string, unknown> | null;
  created_at: string; // ISO timestamp
}

/**
 * API response types
 */

export interface CreateValentineRequest {
  sender_name: string | null;
  receiver_name: string;
}

export interface CreateValentineResponse {
  valentine_id: string;
  receiver_url: string; // URL to share with receiver (contains receiver_token)
  sender_url: string; // URL for sender to check results (contains sender_token)
}

export interface GetValentineByReceiverTokenResponse {
  valentine_id: string;
  sender_name: string | null;
  receiver_name: string;
  status: ValentineStatus;
}

export interface GetValentineBySenderTokenResponse {
  valentine_id: string;
  sender_name: string | null;
  receiver_name: string;
  status: ValentineStatus;
  created_at: string;
  answered_at: string | null;
}

export interface SubmitAnswerRequest {
  answer: 'yes' | 'no';
}

export interface SubmitAnswerResponse {
  success: boolean;
}

export interface TrackEventRequest {
  event_type: string;
  valentine_id?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackEventResponse {
  success: boolean;
}

/**
 * Database schema type for Supabase client
 */
export interface Database {
  public: {
    Tables: {
      valentines: {
        Row: Valentine;
        Insert: Omit<Valentine, 'id' | 'created_at' | 'answered_at'> & {
          id?: string;
          created_at?: string;
          answered_at?: string | null;
        };
        Update: Partial<Omit<Valentine, 'id' | 'created_at'>>;
      };
      result_tokens: {
        Row: ResultToken;
        Insert: Omit<ResultToken, 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Omit<ResultToken, 'token' | 'created_at'>>;
      };
      events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: never; // Events are append-only
      };
    };
  };
}
