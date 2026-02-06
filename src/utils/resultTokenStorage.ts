/**
 * Utility for managing result tokens in localStorage
 * Allows senders to access their Valentine results consistently
 */

const STORAGE_KEY = 'valentine_result_tokens';

export interface StoredToken {
  token: string;
  valentineId: string;
  createdAt: string;
  receiverName: string;
}

/**
 * Store a result token for later access
 */
export function storeResultToken(
  token: string,
  valentineId: string,
  receiverName: string
): void {
  try {
    const tokens = getStoredTokens();
    
    // Add new token
    tokens.push({
      token,
      valentineId,
      receiverName,
      createdAt: new Date().toISOString(),
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Failed to store result token:', error);
  }
}

/**
 * Get all stored result tokens
 */
export function getStoredTokens(): StoredToken[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as StoredToken[];
  } catch (error) {
    console.error('Failed to retrieve stored tokens:', error);
    return [];
  }
}

/**
 * Get a specific result token by valentine ID
 */
export function getResultTokenByValentineId(valentineId: string): string | null {
  const tokens = getStoredTokens();
  const found = tokens.find(t => t.valentineId === valentineId);
  return found ? found.token : null;
}

/**
 * Check if user is the sender of a Valentine (by valentine ID)
 */
export function isSender(valentineId: string): boolean {
  return getResultTokenByValentineId(valentineId) !== null;
}

/**
 * Check if user has access to a result token
 */
export function hasAccessToResult(token: string): boolean {
  const tokens = getStoredTokens();
  return tokens.some(t => t.token === token);
}

/**
 * Clear old tokens (older than 30 days)
 */
export function clearOldTokens(): void {
  try {
    const tokens = getStoredTokens();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = tokens.filter(t => {
      const createdDate = new Date(t.createdAt);
      return createdDate > thirtyDaysAgo;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to clear old tokens:', error);
  }
}
