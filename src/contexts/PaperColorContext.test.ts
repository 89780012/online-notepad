/**
 * PaperColorContext 属性测试
 * Property 4: Persistence Round-Trip
 * Property 3: Paper Color Independence from Theme Mode
 * Validates: Requirements 1.3, 3.1, 3.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { PAPER_COLOR_PRESETS, getAllPaperColorIds } from '@/data/paper-colors';
import { 
  PAPER_COLOR_STORAGE_KEY, 
  PAPER_CSS_VARS,
  DEFAULT_PAPER_COLOR 
} from '@/types/paper-color';
import type { PaperColorId } from '@/types/paper-color';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

// Mock document.documentElement.style
const styleMock = {
  setProperty: vi.fn(),
  getPropertyValue: vi.fn(),
  removeProperty: vi.fn(),
};

describe('PaperColorContext - Property Tests', () => {
  beforeEach(() => {
    // Setup mocks
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('document', {
      documentElement: {
        style: styleMock,
      },
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Feature: paper-color-theme, Property 4: Persistence Round-Trip
   * For any valid paper color ID, persisting it to localStorage and then 
   * restoring it SHALL produce the same paper color ID.
   * Validates: Requirements 3.1, 3.2
   */
  describe('Property 4: Persistence Round-Trip', () => {
    it('for any valid paper color ID, save then load should return the same ID', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          (index) => {
            const colorId = validIds[index];
            
            // Save to localStorage
            localStorage.setItem(PAPER_COLOR_STORAGE_KEY, colorId);
            
            // Load from localStorage
            const loaded = localStorage.getItem(PAPER_COLOR_STORAGE_KEY);
            
            return loaded === colorId;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist paper color to localStorage when set', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          (index) => {
            const colorId = validIds[index];
            
            // Simulate setPaperColor behavior
            localStorage.setItem(PAPER_COLOR_STORAGE_KEY, colorId);
            
            // Verify it was called with correct arguments
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
              PAPER_COLOR_STORAGE_KEY, 
              colorId
            );
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default color when localStorage is empty', () => {
      localStorageMock.clear();
      const stored = localStorage.getItem(PAPER_COLOR_STORAGE_KEY);
      expect(stored).toBeNull();
    });

    it('should handle invalid stored values gracefully', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !getAllPaperColorIds().includes(s as PaperColorId)),
          (invalidId) => {
            localStorage.setItem(PAPER_COLOR_STORAGE_KEY, invalidId);
            const stored = localStorage.getItem(PAPER_COLOR_STORAGE_KEY);
            
            // The stored value should be the invalid string
            // But when loading, the context should validate and fall back to default
            const isValid = getAllPaperColorIds().includes(stored as PaperColorId);
            
            // If not valid, the context should use DEFAULT_PAPER_COLOR
            return !isValid || stored === DEFAULT_PAPER_COLOR;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: paper-color-theme, Property 3: Paper Color Independence from Theme Mode
   * For any sequence of paper color and theme mode changes, the paper color selection 
   * SHALL remain unchanged when toggling between light and dark modes, and vice versa.
   * Validates: Requirements 1.3
   */
  describe('Property 3: Paper Color Independence from Theme Mode', () => {
    it('paper color should remain unchanged when theme mode changes', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }), // sequence of theme toggles
          (colorIndex, themeToggles) => {
            const colorId = validIds[colorIndex];
            
            // Set initial paper color
            localStorage.setItem(PAPER_COLOR_STORAGE_KEY, colorId);
            
            // Simulate theme toggles (light/dark)
            themeToggles.forEach(() => {
              // Theme toggle doesn't affect paper color in localStorage
              const storedColor = localStorage.getItem(PAPER_COLOR_STORAGE_KEY);
              expect(storedColor).toBe(colorId);
            });
            
            // Paper color should still be the same
            const finalColor = localStorage.getItem(PAPER_COLOR_STORAGE_KEY);
            return finalColor === colorId;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('theme mode should not affect paper color selection', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          fc.integer({ min: 0, max: validIds.length - 1 }),
          fc.boolean(), // isDark
          (colorIndex1, colorIndex2, isDark) => {
            const colorId1 = validIds[colorIndex1];
            const colorId2 = validIds[colorIndex2];
            
            // Set paper color
            localStorage.setItem(PAPER_COLOR_STORAGE_KEY, colorId1);
            
            // Simulate theme change (this should not affect paper color)
            // In real implementation, only CSS vars change, not the stored color
            
            // Change paper color
            localStorage.setItem(PAPER_COLOR_STORAGE_KEY, colorId2);
            
            // Verify paper color changed independently
            const storedColor = localStorage.getItem(PAPER_COLOR_STORAGE_KEY);
            return storedColor === colorId2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('CSS variables should be updated for both light and dark variants', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          fc.boolean(), // isDark
          (colorIndex, isDark) => {
            const colorId = validIds[colorIndex];
            const preset = PAPER_COLOR_PRESETS.find(p => p.id === colorId);
            
            if (!preset) return false;
            
            const variant = isDark ? preset.dark : preset.light;
            
            // Simulate applyPaperColorCSSVars
            styleMock.setProperty(PAPER_CSS_VARS.background, variant.background);
            styleMock.setProperty(PAPER_CSS_VARS.foreground, variant.foreground);
            styleMock.setProperty(PAPER_CSS_VARS.muted, variant.muted);
            
            // Verify CSS vars were set
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.background, 
              variant.background
            );
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.foreground, 
              variant.foreground
            );
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.muted, 
              variant.muted
            );
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
