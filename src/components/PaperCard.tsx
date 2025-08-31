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
      setLineColor('#374151'); // 暗色模式下的线条颜色
    } else {
      setLineColor('#e5e7eb'); // 亮色模式下的线条颜色
    }
  }, [resolvedTheme]);

  return (
    <Card className={`bg-card shadow-xl border-0 relative overflow-hidden ${className}`}>
      {/* 纸张边距线 */}
      <div className="absolute left-16 top-0 bottom-0 w-px bg-red-300 dark:bg-red-400 z-10"></div>
      <div className="absolute left-20 top-0 bottom-0 w-px bg-blue-200 dark:bg-blue-300 z-10"></div>
      
      {/* 可选的头部区域 */}
      {header && (
        <CardHeader className="border-b border-border bg-muted/30 relative z-20">
          {header}
        </CardHeader>
      )}
      
      {/* 纸张样式的内容区域 */}
      <CardContent 
        className="p-0 bg-card relative" 
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