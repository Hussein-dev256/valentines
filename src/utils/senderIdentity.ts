/**
 * Sender Identity Management
 * 
 * Generates and manages anonymous sender IDs for robust sender identification
 * across devices, sessions, and incognito mode.
 * 
 * Strategy:
 * - Generate UNIQUE UUID per Valentine creation
 * - Store mapping of valentine_id -> sender_id in localStorage
 * - Store in database (source of truth)
 * - Validate on every request
 */

const SENDER_MAPPINGS_KEY = 'valentine_sender_mappings';

interface SenderMapping {
  valentineId: string;
  senderId: string;
  createdAt: string;
}

/**
 * Generate a new anonymous sender ID
 */
export function generateSenderId(): string {
  return crypto.randomUUID();
}

/**
 * Get the sender ID for a specific valentine
 * Returns null if not found
 */
export function getSenderIdForValentine(valentineId: string): string | null {
  try {
    const mappings = getSenderMappings();
    const mapping = mappings.find(m => m.valentineId === valentineId);
    return mapping ? mapping.senderId : null;
  } catch (error) {
    console.error('Failed to get sender ID for valentine:', error);
    return null;
  }
}

/**
 * Store sender ID mapping for a valentine
 */
export function storeSenderMapping(valentineId: string, senderId: string): void {
  try {
    const mappings = getSenderMappings();
    
    // Add new mapping
    mappings.push({
      valentineId,
      senderId,
      createdAt: new Date().toISOString(),
    });
    
    localStorage.setItem(SENDER_MAPPINGS_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Failed to store sender mapping:', error);
  }
}

/**
 * Get all sender mappings
 */
function getSenderMappings(): SenderMapping[] {
  try {
    const stored = localStorage.getItem(SENDER_MAPPINGS_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as SenderMapping[];
  } catch (error) {
    console.error('Failed to retrieve sender mappings:', error);
    return [];
  }
}

/**
 * Get the sender ID from localStorage (legacy - for backward compatibility)
 * Returns null if not found
 * 
 * @deprecated Use getSenderIdForValentine instead
 */
export function getSenderId(): string | null {
  try {
    // For validation, we need to check if ANY valentine belongs to this user
    // This is used by validateSenderAccess to get the local sender ID
    // But we need the valentine ID to know which sender_id to use
    // So this function is now deprecated
    return null;
  } catch (error) {
    console.error('Failed to get sender ID:', error);
    return null;
  }
}

/**
 * Clear old sender mappings (older than 30 days)
 */
export function clearOldSenderMappings(): void {
  try {
    const mappings = getSenderMappings();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = mappings.filter(m => {
      const createdDate = new Date(m.createdAt);
      return createdDate > thirtyDaysAgo;
    });
    
    localStorage.setItem(SENDER_MAPPINGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to clear old sender mappings:', error);
  }
}
