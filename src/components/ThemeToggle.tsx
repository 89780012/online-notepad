'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from 'next-intl';

interface ThemeToggleProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export function ThemeToggle({ 
  className,
  size = 'icon',
  variant = 'ghost'
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations();

  const handleToggle = () => {
    // 循环切换：light -> dark -> system -> light
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4 transition-all" />;
      case 'dark':
        return <Moon className="h-4 w-4 transition-all" />;
      case 'system':
        return <Monitor className="h-4 w-4 transition-all" />;
      default:
        return <Sun className="h-4 w-4 transition-all" />;
    }
  };

  const getAriaLabel = () => {
    switch (theme) {
      case 'light':
        return t('toggleToDarkMode');
      case 'dark':
        return t('toggleToSystemMode');
      case 'system':
        return t('toggleToLightMode');
      default:
        return t('toggleTheme');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={className}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {getIcon()}
    </Button>
  );
}

export default ThemeToggle;