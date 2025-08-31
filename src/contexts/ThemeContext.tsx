'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system' 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 获取系统主题偏好
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 应用主题到DOM
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setResolvedTheme(newTheme);
  };

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // 持久化到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notepad-theme', newTheme);
    }
    
    // 计算实际应用的主题
    const actualTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    applyTheme(actualTheme);
  };

  // 初始化主题
  useEffect(() => {
    // 从 localStorage 读取主题偏好
    const savedTheme = typeof window !== 'undefined' 
      ? localStorage.getItem('notepad-theme') as Theme 
      : null;
    
    const initialTheme = savedTheme || defaultTheme;
    setThemeState(initialTheme);
    
    // 计算实际应用的主题
    const actualTheme = initialTheme === 'system' ? getSystemTheme() : initialTheme;
    applyTheme(actualTheme);
  }, [defaultTheme]);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    };

    // 监听系统主题变化
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        resolvedTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}