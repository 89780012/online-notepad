'use client';

import { useCallback, useRef } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { usePaperColor } from '@/contexts/PaperColorContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { PaperColorId, PaperColorPreset } from '@/types/paper-color';

interface PaperColorSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'inline';
}

/**
 * 获取预设的预览颜色（用于色块显示）
 */
function getPreviewColor(preset: PaperColorPreset, isDark: boolean): string {
  const variant = isDark ? preset.dark : preset.light;
  return variant.background;
}

/**
 * 纸张颜色选择器组件
 */
export function PaperColorSelector({
  className,
  variant = 'dropdown',
}: PaperColorSelectorProps) {
  const t = useTranslations();
  const { paperColor, setPaperColor, presets } = usePaperColor();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // 用于键盘导航的引用
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSelect = useCallback((colorId: PaperColorId) => {
    setPaperColor(colorId);
  }, [setPaperColor]);

  // 键盘导航处理
  const handleKeyDown = useCallback((
    event: React.KeyboardEvent,
    index: number,
    colorId: PaperColorId
  ) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleSelect(colorId);
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (index + 1) % presets.length;
        itemRefs.current[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (index - 1 + presets.length) % presets.length;
        itemRefs.current[prevIndex]?.focus();
        break;
    }
  }, [handleSelect, presets.length]);

  // 内联模式：直接显示色块
  if (variant === 'inline') {
    return (
      <div 
        className={`flex items-center gap-1.5 ${className || ''}`}
        role="radiogroup"
        aria-label={t('paperColor.selectLabel') || '选择纸张颜色'}
      >
        {presets.map((preset, index) => (
          <button
            key={preset.id}
            ref={(el) => { itemRefs.current[index] = el as HTMLDivElement | null; }}
            onClick={() => handleSelect(preset.id)}
            onKeyDown={(e) => handleKeyDown(e, index, preset.id)}
            className={`
              relative w-6 h-6 rounded-full border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${paperColor === preset.id 
                ? 'border-primary scale-110' 
                : 'border-border hover:border-primary/50 hover:scale-105'
              }
            `}
            style={{ backgroundColor: getPreviewColor(preset, isDark) }}
            role="radio"
            aria-checked={paperColor === preset.id}
            aria-label={t(preset.name) || preset.id}
            title={t(preset.name) || preset.id}
            tabIndex={paperColor === preset.id ? 0 : -1}
          >
            {paperColor === preset.id && (
              <Check 
                className="absolute inset-0 m-auto w-3 h-3 text-primary" 
                strokeWidth={3}
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // 下拉菜单模式
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors gap-2 ${className || ''}`}
          aria-label={t('paperColor.selectLabel') || '选择纸张颜色'}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">{t('paperColor.label') || '纸张'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 shadow-lg">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('paperColor.selectLabel') || '选择纸张颜色'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {presets.map((preset, index) => (
          <DropdownMenuItem
            key={preset.id}
            ref={(el) => { itemRefs.current[index] = el as HTMLDivElement | null; }}
            onClick={() => handleSelect(preset.id)}
            onKeyDown={(e) => handleKeyDown(e, index, preset.id)}
            className="cursor-pointer gap-3 py-2.5"
            role="menuitemradio"
            aria-checked={paperColor === preset.id}
          >
            {/* 颜色预览色块 */}
            <div
              className={`
                w-5 h-5 rounded-full border-2 flex-shrink-0
                ${paperColor === preset.id ? 'border-primary' : 'border-border'}
              `}
              style={{ backgroundColor: getPreviewColor(preset, isDark) }}
            />
            {/* 颜色名称 */}
            <span className="flex-1">{t(preset.name) || preset.id}</span>
            {/* 选中指示器 */}
            {paperColor === preset.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default PaperColorSelector;
