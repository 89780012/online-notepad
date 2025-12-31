'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { PaperColorId, PaperColorContextType } from '@/types/paper-color';
import { 
  PAPER_CSS_VARS, 
  PAPER_COLOR_STORAGE_KEY, 
  DEFAULT_PAPER_COLOR 
} from '@/types/paper-color';
import { 
  PAPER_COLOR_PRESETS, 
  getPaperColorPreset, 
  isValidPaperColorId 
} from '@/data/paper-colors';
import { useTheme } from './ThemeContext';

const PaperColorContext = createContext<PaperColorContextType | undefined>(undefined);

interface PaperColorProviderProps {
  children: ReactNode;
  defaultColor?: PaperColorId;
}

/**
 * 应用纸张颜色 CSS 变量到 document root
 */
function applyPaperColorCSSVars(colorId: PaperColorId, isDark: boolean): void {
  if (typeof window === 'undefined') return;

  const preset = getPaperColorPreset(colorId);
  if (!preset) return;

  const variant = isDark ? preset.dark : preset.light;
  const root = document.documentElement;

  root.style.setProperty(PAPER_CSS_VARS.background, variant.background);
  root.style.setProperty(PAPER_CSS_VARS.foreground, variant.foreground);
  root.style.setProperty(PAPER_CSS_VARS.muted, variant.muted);
}

/**
 * 从 localStorage 读取纸张颜色
 */
function loadPaperColorFromStorage(): PaperColorId {
  if (typeof window === 'undefined') return DEFAULT_PAPER_COLOR;

  try {
    const stored = localStorage.getItem(PAPER_COLOR_STORAGE_KEY);
    if (stored && isValidPaperColorId(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to load paper color from localStorage:', error);
  }

  return DEFAULT_PAPER_COLOR;
}

/**
 * 保存纸张颜色到 localStorage
 */
function savePaperColorToStorage(colorId: PaperColorId): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PAPER_COLOR_STORAGE_KEY, colorId);
  } catch (error) {
    console.warn('Failed to save paper color to localStorage:', error);
  }
}

export function PaperColorProvider({
  children,
  defaultColor = DEFAULT_PAPER_COLOR
}: PaperColorProviderProps) {
  const [paperColor, setPaperColorState] = useState<PaperColorId>(defaultColor);
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // 设置纸张颜色
  const setPaperColor = useCallback((colorId: PaperColorId) => {
    if (!isValidPaperColorId(colorId)) {
      console.warn(`Invalid paper color ID: ${colorId}`);
      return;
    }

    setPaperColorState(colorId);
    savePaperColorToStorage(colorId);
    applyPaperColorCSSVars(colorId, resolvedTheme === 'dark');
  }, [resolvedTheme]);

  // 初始化：从 localStorage 加载纸张颜色
  useEffect(() => {
    setIsMounted(true);
    const storedColor = loadPaperColorFromStorage();
    setPaperColorState(storedColor);
  }, []);

  // 当主题或纸张颜色变化时，更新 CSS 变量
  useEffect(() => {
    if (!isMounted) return;
    applyPaperColorCSSVars(paperColor, resolvedTheme === 'dark');
  }, [paperColor, resolvedTheme, isMounted]);

  return (
    <PaperColorContext.Provider
      value={{
        paperColor,
        setPaperColor,
        presets: PAPER_COLOR_PRESETS,
      }}
    >
      {children}
    </PaperColorContext.Provider>
  );
}

/**
 * Hook for using paper color
 */
export function usePaperColor() {
  const context = useContext(PaperColorContext);

  if (context === undefined) {
    throw new Error('usePaperColor must be used within a PaperColorProvider');
  }

  return context;
}

// 导出工具函数供测试使用
export const _testUtils = {
  applyPaperColorCSSVars,
  loadPaperColorFromStorage,
  savePaperColorToStorage,
};
