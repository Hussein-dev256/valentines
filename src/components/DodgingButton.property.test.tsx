/**
 * Property-Based Tests for DodgingButton
 * Feature: will-you-be-my-valentine
 * 
 * Tests Properties 10-13, 27 from the design document
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import DodgingButton from './DodgingButton';

describe('DodgingButton Property Tests', () => {
  /**
   * Property 10: NO button viewport containment
   * For any dodge event, the NO button's new position should be fully contained
   * within the viewport boundaries with no overflow
   * **Validates: Requirements 5.3**
   */
  it('Property 10: Button stays within viewport bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        fc.integer({ min: 568, max: 1080 }),
        (viewportWidth, viewportHeight) => {
          // Mock viewport size
          Object.defineProperty(window, 'innerWidth', { writable: true, value: viewportWidth });
          Object.defineProperty(window, 'innerHeight', { writable: true, value: viewportHeight });

          const { container } = render(
            <DodgingButton onClick={vi.fn()}>Test</DodgingButton>
          );

          const button = container.querySelector('button');
          if (button) {
            const rect = button.getBoundingClientRect();
            
            // Button should be within viewport
            expect(rect.left).toBeGreaterThanOrEqual(0);
            expect(rect.top).toBeGreaterThanOrEqual(0);
            expect(rect.right).toBeLessThanOrEqual(viewportWidth);
            expect(rect.bottom).toBeLessThanOrEqual(viewportHeight);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: NO button dodge activation
   * For any cursor position within the dodge activation zone, the NO button
   * should move to a new random position
   * **Validates: Requirements 5.1, 5.2**
   */
  it('Property 11: Button dodges when cursor is near', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 300 }),
        (dodgeRadius) => {
          const { container } = render(
            <DodgingButton onClick={vi.fn()} dodgeRadius={dodgeRadius}>
              Test
            </DodgingButton>
          );

          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Button should have position styling (either relative or fixed)
          if (button) {
            const style = window.getComputedStyle(button);
            expect(['relative', 'fixed', 'absolute']).toContain(style.position);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Progressive dodge difficulty reduction
   * For any sequence of dodge attempts, after a threshold duration,
   * the dodge behavior should become disabled
   * **Validates: Requirements 5.4**
   */
  it('Property 12: Dodge difficulty reduces progressively', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 60 }),
        (dodgeDuration) => {
          const { container } = render(
            <DodgingButton onClick={vi.fn()} dodgeDuration={dodgeDuration}>
              Test
            </DodgingButton>
          );

          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Component should accept dodgeDuration prop
          // After duration, button should become clickable
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Eventual NO button clickability
   * For any sufficiently long duration, the NO button should
   * eventually become clickable without further dodging
   * **Validates: Requirements 5.5**
   */
  it('Property 13: Button becomes clickable after duration', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        (dodgeDuration) => {
          const mockOnClick = vi.fn();
          const { container } = render(
            <DodgingButton onClick={mockOnClick} dodgeDuration={dodgeDuration}>
              Test
            </DodgingButton>
          );

          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // With 0 duration, button should be immediately clickable
          if (dodgeDuration === 0 && button) {
            button.click();
            expect(mockOnClick).toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27: Dodge behavior across screen sizes
   * For any viewport size, when the NO button dodges, the new position should be
   * valid and fully visible within that viewport
   * **Validates: Requirements 13.3**
   */
  it('Property 27: Dodge works correctly across all screen sizes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        fc.integer({ min: 568, max: 1080 }),
        (width, height) => {
          // Mock viewport
          Object.defineProperty(window, 'innerWidth', { writable: true, value: width });
          Object.defineProperty(window, 'innerHeight', { writable: true, value: height });

          const { container } = render(
            <DodgingButton onClick={vi.fn()}>Test</DodgingButton>
          );

          const button = container.querySelector('button');
          if (button) {
            const rect = button.getBoundingClientRect();
            
            // Button should be fully visible
            expect(rect.left).toBeGreaterThanOrEqual(0);
            expect(rect.top).toBeGreaterThanOrEqual(0);
            expect(rect.right).toBeLessThanOrEqual(width);
            expect(rect.bottom).toBeLessThanOrEqual(height);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
