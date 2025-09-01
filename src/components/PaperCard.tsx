'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PaperCardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

export default function PaperCard({ children, header, className = "" }: PaperCardProps) {
  const { resolvedTheme } = useTheme();
  const [lineColor, setLineColor] = useState('#e5e7eb');

  useEffect(() => {
    // 根据主题设置线条颜色
    if (resolvedTheme === 'dark') {
      setLineColor('oklch(0.285 0.022 79.5)'); // 使用新的暗色纸张边框色
    } else {
      setLineColor('oklch(0.896 0.015 75.8)'); // 使用新的亮色纸张边框色
    }
  }, [resolvedTheme]);

  return (
    <Card className={`bg-card/95 backdrop-blur-sm shadow-2xl border border-border/50 relative overflow-hidden paper-texture ${className}`}>
      {/* 纸张边距线 - 更加精致的样式 */}
      <div className="absolute left-16 top-0 bottom-0 w-px bg-red-400/60 dark:bg-red-300/40 z-10 shadow-sm"></div>
      <div className="absolute left-20 top-0 bottom-0 w-px bg-blue-300/50 dark:bg-blue-200/30 z-10 shadow-sm"></div>
      
      {/* 纸张孔洞效果 */}
      <div className="absolute left-8 top-8 w-2 h-2 bg-background border border-border/30 rounded-full shadow-inner"></div>
      <div className="absolute left-8 top-16 w-2 h-2 bg-background border border-border/30 rounded-full shadow-inner"></div>
      <div className="absolute left-8 top-24 w-2 h-2 bg-background border border-border/30 rounded-full shadow-inner"></div>
      
      {/* 可选的头部区域 */}
      {header && (
        <CardHeader className="border-b border-border/30 bg-muted/20 backdrop-blur-sm relative z-20">
          {header}
        </CardHeader>
      )}
      
      {/* 纸张样式的内容区域 */}
      <CardContent 
        className="p-0 bg-card/90 backdrop-blur-sm relative" 
        style={{
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 31px,
            ${lineColor} 31px,
            ${lineColor} 32px
          )`,
          paddingTop: '32px',
          paddingBottom: '32px'
        }}
      >
        <div className="px-8 relative">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}