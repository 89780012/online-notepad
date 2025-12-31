/**
 * 纸张颜色 CSS 变量命名规范属性测试
 * Property 6: CSS Variable Naming Convention
 * Validates: Requirements 5.1, 5.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PAPER_CSS_VARS } from './paper-color';

// CSS 变量命名规范正则表达式
const CSS_VAR_PATTERN = /^--paper-(background|foreground|muted)$/;

describe('Paper Color CSS Variables - Property Tests', () => {
  /**
   * Feature: paper-color-theme, Property 6: CSS Variable Naming Convention
   * For any CSS variable defined by the paper color system, the variable name 
   * SHALL match the pattern `--paper-{property}` where property is one of: 
   * background, foreground, muted.
   * Validates: Requirements 5.1, 5.2
   */
  describe('Property 6: CSS Variable Naming Convention', () => {
    it('all CSS variable names should match the naming pattern', () => {
      const varNames = Object.values(PAPER_CSS_VARS);
      
      varNames.forEach(varName => {
        expect(varName).toMatch(CSS_VAR_PATTERN);
      });
    });

    it('should have exactly 3 CSS variables defined', () => {
      const varNames = Object.values(PAPER_CSS_VARS);
      expect(varNames.length).toBe(3);
    });

    it('should include background, foreground, and muted variables', () => {
      expect(PAPER_CSS_VARS.background).toBe('--paper-background');
      expect(PAPER_CSS_VARS.foreground).toBe('--paper-foreground');
      expect(PAPER_CSS_VARS.muted).toBe('--paper-muted');
    });

    it('for any CSS variable key, the value should follow naming convention', () => {
      const keys = Object.keys(PAPER_CSS_VARS) as (keyof typeof PAPER_CSS_VARS)[];
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: keys.length - 1 }),
          (index) => {
            const key = keys[index];
            const value = PAPER_CSS_VARS[key];
            
            // Value should start with --paper-
            if (!value.startsWith('--paper-')) return false;
            
            // Value should match the pattern
            if (!CSS_VAR_PATTERN.test(value)) return false;
            
            // The property part should match the key
            const propertyPart = value.replace('--paper-', '');
            return propertyPart === key;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('CSS variable names should be unique', () => {
      const varNames = Object.values(PAPER_CSS_VARS);
      const uniqueNames = new Set(varNames);
      expect(uniqueNames.size).toBe(varNames.length);
    });

    it('CSS variable keys should be unique', () => {
      const keys = Object.keys(PAPER_CSS_VARS);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });
});
