/**
 * 纸张颜色预设属性测试
 * Property 1: Color Presets Completeness
 * Validates: Requirements 1.1, 1.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  PAPER_COLOR_PRESETS, 
  getPaperColorPreset, 
  isValidPaperColorId,
  getAllPaperColorIds 
} from './paper-colors';
import type { PaperColorPreset, PaperColorVariant } from '@/types/paper-color';

// oklch 颜色格式正则表达式
const OKLCH_REGEX = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;

/**
 * 验证颜色变体是否完整且格式正确
 */
function isValidColorVariant(variant: PaperColorVariant): boolean {
  return (
    typeof variant.background === 'string' &&
    typeof variant.foreground === 'string' &&
    typeof variant.muted === 'string' &&
    OKLCH_REGEX.test(variant.background) &&
    OKLCH_REGEX.test(variant.foreground) &&
    OKLCH_REGEX.test(variant.muted)
  );
}

/**
 * 验证预设是否完整
 */
function isValidPreset(preset: PaperColorPreset): boolean {
  return (
    typeof preset.id === 'string' &&
    preset.id.length > 0 &&
    typeof preset.name === 'string' &&
    preset.name.length > 0 &&
    isValidColorVariant(preset.light) &&
    isValidColorVariant(preset.dark)
  );
}

describe('Paper Color Presets - Property Tests', () => {
  /**
   * Feature: paper-color-theme, Property 1: Color Presets Completeness
   * For any paper color preset in the system, it SHALL have both light and dark 
   * variants with valid oklch color values for background, foreground, and muted properties.
   * Validates: Requirements 1.1, 1.4
   */
  describe('Property 1: Color Presets Completeness', () => {
    it('should have at least 5 predefined color presets', () => {
      expect(PAPER_COLOR_PRESETS.length).toBeGreaterThanOrEqual(5);
    });

    it('should include required color presets: default, eye-care, sepia, light-blue, light-green', () => {
      const requiredIds = ['default', 'eye-care', 'sepia', 'light-blue', 'light-green'];
      const presetIds = PAPER_COLOR_PRESETS.map(p => p.id);
      
      requiredIds.forEach(id => {
        expect(presetIds).toContain(id);
      });
    });

    it('for any preset index, the preset should have valid structure', () => {
      // 生成随机索引来测试预设
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PAPER_COLOR_PRESETS.length - 1 }),
          (index) => {
            const preset = PAPER_COLOR_PRESETS[index];
            return isValidPreset(preset);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any preset, light variant should have valid oklch colors', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PAPER_COLOR_PRESETS.length - 1 }),
          (index) => {
            const preset = PAPER_COLOR_PRESETS[index];
            return isValidColorVariant(preset.light);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any preset, dark variant should have valid oklch colors', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PAPER_COLOR_PRESETS.length - 1 }),
          (index) => {
            const preset = PAPER_COLOR_PRESETS[index];
            return isValidColorVariant(preset.dark);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all presets should have unique IDs', () => {
      const ids = PAPER_COLOR_PRESETS.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Helper Functions', () => {
    it('getPaperColorPreset should return correct preset for valid ID', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PAPER_COLOR_PRESETS.length - 1 }),
          (index) => {
            const preset = PAPER_COLOR_PRESETS[index];
            const result = getPaperColorPreset(preset.id);
            return result !== undefined && result.id === preset.id;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getPaperColorPreset should return undefined for invalid ID', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !getAllPaperColorIds().includes(s as never)),
          (invalidId) => {
            const result = getPaperColorPreset(invalidId as never);
            return result === undefined;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isValidPaperColorId should return true for all preset IDs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: PAPER_COLOR_PRESETS.length - 1 }),
          (index) => {
            const preset = PAPER_COLOR_PRESETS[index];
            return isValidPaperColorId(preset.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isValidPaperColorId should return false for invalid IDs', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !getAllPaperColorIds().includes(s as never)),
          (invalidId) => {
            return !isValidPaperColorId(invalidId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getAllPaperColorIds should return all preset IDs', () => {
      const ids = getAllPaperColorIds();
      expect(ids.length).toBe(PAPER_COLOR_PRESETS.length);
      PAPER_COLOR_PRESETS.forEach(preset => {
        expect(ids).toContain(preset.id);
      });
    });
  });
});
