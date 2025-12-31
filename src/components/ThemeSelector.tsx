'use client';

import { useCallback, useRef } from 'react';
import { Moon, Sun, Monitor, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { usePaperColor } from '@/contexts/PaperColorContext';
import { useTranslations } from 'next-intl';
import type { PaperColorId, PaperColorPreset } from '@/types/paper-color';

interface ThemeSelectorProps {
  className?: string;
}

type ThemeMode = 'light' | 'dark' | 'system';

const themeModes: ThemeMode[] = ['light', 'dark', 'system'];

/**
 * 获取预设的预览颜色（用于色块显示）
 */
function getPreviewColor(preset: PaperColorPreset, isDark: boolean): string {
  const variant = isDark ? preset.dark : preset.light;
  return variant.background;
}

/**
 * 统一主题选择器组件
 * 包含明暗模式切换和纸张颜色选择
 */
export function ThemeSelector({ className }: ThemeSelectorProps) {
  const t = useTranslations();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { paperColor, setPaperColor, presets } = usePaperColor();
  const isDark = resolvedTheme === 'dark';
  
  const paperColorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleThemeSelect = useCallback((mode: ThemeMode) => {
    setTheme(mode);
  }, [setTheme]);

  const handlePaperColorSelect = useCallback((colorId: PaperColorId) => {
    setPaperColor(colorId);
  }, [setPaperColor]);

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return t('lightMode') || '浅色模式';
      case 'dark':
        return t('darkMode') || '深色模式';
      case 'system':
        return t('systemMode') || '跟随系统';
    }
  };

  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label={t('themeSettings') || '主题设置'}
        >
          {getCurrentIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-lg">
        {/* 明暗模式部分 */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('themeMode') || '显示模式'}
        </DropdownMenuLabel>
        {themeModes.map((mode) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => handleThemeSelect(mode)}
            className="cursor-pointer gap-3 py-2"
            role="menuitemradio"
            aria-checked={theme === mode}
          >
            {getThemeIcon(mode)}
            <span className="flex-1">{getThemeLabel(mode)}</span>
            {theme === mode && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* 纸张颜色部分 */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3 h-3" />
          {t('paperColor.label') || '纸张颜色'}
        </DropdownMenuLabel>
        {presets.map((preset, index) => (
          <DropdownMenuItem
            key={preset.id}
            ref={(el) => { paperColorRefs.current[index] = el as HTMLDivElement | null; }}
            onClick={() => handlePaperColorSelect(preset.id)}
            className="cursor-pointer gap-3 py-2"
            role="menuitemradio"
            aria-checked={paperColor === preset.id}
          >
            {/* 颜色预览色块 */}
            <div
              className={`
                w-4 h-4 rounded-full border-2 flex-shrink-0
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

export default ThemeSelector;
