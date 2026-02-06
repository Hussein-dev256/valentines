/**
 * Sender Identity Management
 * 
 * Generates and manages anonymous sender IDs for robust sender identification
 * across devices, sessions, and incognito mode.
 * 
 * Strategy:
 * - Generate UUID on Valentine creation
 * - Store in localStorage (for convenience)
 * - Store in database (source of truth)
 * - Send with every request for validation
 */

const SENDER_ID_KEY = 'valentine_sender_id';

/**
 * Generate a new anonymous sender ID
 */
export function generateSenderId(): string {
  return crypto.randomUUID();
}

/**
 * Get the current sender ID from localStorage
 * Returns null if not found
 */
export function getSenderId(): string | null {
  try {
    return localStorage.getItem(SENDER_ID_KEY);
  } catch (error) {
    console.error('Failed to get sender ID:', error);
    return null;
  }
}

/**
 * Store sender ID in localStorage
 */
export function storeSenderId(senderId: string): void {
  try {
    localStorage.setItem(SENDER_ID_KEY, senderId);
  } catch (error) {
    console.error('Failed to store sender ID:', error);
  }
}

/**
 * Get or create sender ID
 * Returns existing ID from localStorage or generates a new one
 */
export function getOrCreateSenderId(): string {
  const existing = getSenderId();
  if (existing) {
    return existing;
  }
  
  const newId = generateSenderId();
  storeSenderId(newId);
  return newId;
}

/**
 * Clear sender ID from localStorage
 * Used for testing or logout scenarios
 */
export function clearSenderId(): void {
  try {
    localStorage.removeItem(SENDER_ID_KEY);
  } catch (error) {
    console.error('Failed to clear sender ID:', error);
  }
}
