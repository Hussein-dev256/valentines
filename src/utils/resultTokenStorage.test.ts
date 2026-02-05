import { describe, it, expect, beforeEach } from 'vitest';
import {
  storeResultToken,
  getResultTokenByValentineId,
  isSender,
  getStoredTokens,
} from './resultTokenStorage';

describe('resultTokenStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Role Separation Logic', () => {
    it('should correctly identify sender of a specific Valentine', () => {
      // User creates Valentine A
      storeResultToken('token-a', 'valentine-a', 'Alice');
      
      // User should be identified as sender of Valentine A
      expect(isSender('valentine-a')).toBe(true);
      expect(getResultTokenByValentineId('valentine-a')).toBe('token-a');
    });

    it('should NOT identify user as sender of different Valentine', () => {
      // User creates Valentine A
      storeResultToken('token-a', 'valentine-a', 'Alice');
      
      // User should NOT be identified as sender of Valentine B
      expect(isSender('valentine-b')).toBe(false);
      expect(getResultTokenByValentineId('valentine-b')).toBe(null);
    });

    it('should handle multiple Valentines correctly', () => {
      // User creates multiple Valentines
      storeResultToken('token-a', 'valentine-a', 'Alice');
      storeResultToken('token-b', 'valentine-b', 'Bob');
      storeResultToken('token-c', 'valentine-c', 'Charlie');
      
      // User should be identified as sender of all three
      expect(isSender('valentine-a')).toBe(true);
      expect(isSender('valentine-b')).toBe(true);
      expect(isSender('valentine-c')).toBe(true);
      
      // But NOT sender of a different Valentine
      expect(isSender('valentine-d')).toBe(false);
      
      // Should retrieve correct tokens
      expect(getResultTokenByValentineId('valentine-a')).toBe('token-a');
      expect(getResultTokenByValentineId('valentine-b')).toBe('token-b');
      expect(getResultTokenByValentineId('valentine-c')).toBe('token-c');
      expect(getResultTokenByValentineId('valentine-d')).toBe(null);
    });

    it('should store all tokens in localStorage', () => {
      storeResultToken('token-a', 'valentine-a', 'Alice');
      storeResultToken('token-b', 'valentine-b', 'Bob');
      
      const tokens = getStoredTokens();
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({
        token: 'token-a',
        valentineId: 'valentine-a',
        receiverName: 'Alice',
      });
      expect(tokens[1]).toMatchObject({
        token: 'token-b',
        valentineId: 'valentine-b',
        receiverName: 'Bob',
      });
    });
  });

  describe('Receiver Scenario', () => {
    it('receiver who created other Valentines should NOT be identified as sender of received Valentine', () => {
      // Receiver previously created their own Valentine
      storeResultToken('my-token', 'my-valentine', 'Someone');
      
      // Receiver opens a Valentine sent TO them
      const receivedValentineId = 'received-valentine';
      
      // Should NOT be identified as sender
      expect(isSender(receivedValentineId)).toBe(false);
      expect(getResultTokenByValentineId(receivedValentineId)).toBe(null);
      
      // But should still be sender of their own Valentine
      expect(isSender('my-valentine')).toBe(true);
    });
  });
});
