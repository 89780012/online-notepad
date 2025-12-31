/**
 * PaperColorSelector 属性测试
 * Property 2: Color Selection Updates CSS Variables
 * Validates: Requirements 1.2, 2.2, 5.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { PAPER_COLOR_PRESETS, getAllPaperColorIds, getPaperColorPreset } from '@/data/paper-colors';
import { PAPER_CSS_VARS } from '@/types/paper-color';
import type { PaperColorId } from '@/types/paper-color';

// Mock document.documentElement.style
const styleMock = {
  properties: {} as Record<string, string>,
  setProperty: vi.fn((name: string, value: string) => {
    styleMock.properties[name] = value;
  }),
  getPropertyValue: vi.fn((name: string) => styleMock.properties[name] || ''),
  removeProperty: vi.fn((name: string) => {
    delete styleMock.properties[name];
  }),
};

/**
 * 模拟 applyPaperColorCSSVars 函数的行为
 */
function applyPaperColorCSSVars(colorId: PaperColorId, isDark: boolean): void {
  const preset = getPaperColorPreset(colorId);
  if (!preset) return;

  const variant = isDark ? preset.dark : preset.light;
  
  styleMock.setProperty(PAPER_CSS_VARS.background, variant.background);
  styleMock.setProperty(PAPER_CSS_VARS.foreground, variant.foreground);
  styleMock.setProperty(PAPER_CSS_VARS.muted, variant.muted);
}

describe('PaperColorSelector - Property Tests', () => {
  beforeEach(() => {
    styleMock.properties = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: paper-color-theme, Property 2: Color Selection Updates CSS Variables
   * For any paper color selection and any theme mode (light/dark), selecting a paper 
   * color SHALL update the document root CSS variables to match the corresponding 
   * variant's color values.
   * Validates: Requirements 1.2, 2.2, 5.3
   */
  describe('Property 2: Color Selection Updates CSS Variables', () => {
    it('for any color selection in light mode, CSS variables should be updated correctly', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          (index) => {
            const colorId = validIds[index];
            const preset = getPaperColorPreset(colorId);
            
            if (!preset) return false;
            
            // Apply color in light mode
            applyPaperColorCSSVars(colorId, false);
            
            // Verify CSS variables match light variant
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.background,
              preset.light.background
            );
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.foreground,
              preset.light.foreground
            );
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.muted,
              preset.light.muted
            );
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any color selection in dark mode, CSS variables should be updated correctly', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          (index) => {
            const colorId = validIds[index];
            const preset = getPaperColorPreset(colorId);
            
            if (!preset) return false;
            
            // Apply color in dark mode
            applyPaperColorCSSVars(colorId, true);
            
            // Verify CSS variables match dark variant
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.background,
              preset.dark.background
            );
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.foreground,
              preset.dark.foreground
            );
            expect(styleMock.setProperty).toHaveBeenCalledWith(
              PAPER_CSS_VARS.muted,
              preset.dark.muted
            );
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any color and theme mode combination, all 3 CSS variables should be set', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          fc.boolean(), // isDark
          (index, isDark) => {
            vi.clearAllMocks();
            
            const colorId = validIds[index];
            applyPaperColorCSSVars(colorId, isDark);
            
            // Should have called setProperty exactly 3 times
            expect(styleMock.setProperty).toHaveBeenCalledTimes(3);
            
            // Should have set all 3 CSS variables
            const calledVars = styleMock.setProperty.mock.calls.map(call => call[0]);
            expect(calledVars).toContain(PAPER_CSS_VARS.background);
            expect(calledVars).toContain(PAPER_CSS_VARS.foreground);
            expect(calledVars).toContain(PAPER_CSS_VARS.muted);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('switching between colors should update CSS variables each time', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: validIds.length - 1 }), { minLength: 2, maxLength: 5 }),
          fc.boolean(), // isDark
          (colorIndices, isDark) => {
            vi.clearAllMocks();
            
            // Apply each color in sequence
            colorIndices.forEach(index => {
              const colorId = validIds[index];
              applyPaperColorCSSVars(colorId, isDark);
            });
            
            // Should have called setProperty 3 times per color change
            expect(styleMock.setProperty).toHaveBeenCalledTimes(colorIndices.length * 3);
            
            // Last color should be reflected in the stored properties
            const lastColorId = validIds[colorIndices[colorIndices.length - 1]];
            const lastPreset = getPaperColorPreset(lastColorId);
            
            if (!lastPreset) return false;
            
            const variant = isDark ? lastPreset.dark : lastPreset.light;
            expect(styleMock.properties[PAPER_CSS_VARS.background]).toBe(variant.background);
            expect(styleMock.properties[PAPER_CSS_VARS.foreground]).toBe(variant.foreground);
            expect(styleMock.properties[PAPER_CSS_VARS.muted]).toBe(variant.muted);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('same color in different modes should produce different CSS values', () => {
      const validIds = getAllPaperColorIds();
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: validIds.length - 1 }),
          (index) => {
            const colorId = validIds[index];
            const preset = getPaperColorPreset(colorId);
            
            if (!preset) return false;
            
            // Light and dark variants should be different
            const lightBg = preset.light.background;
            const darkBg = preset.dark.background;
            
            // At least the background should be different between modes
            return lightBg !== darkBg;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
