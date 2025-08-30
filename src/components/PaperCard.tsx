'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ReactNode } from 'react';

interface PaperCardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

export default function PaperCard({ children, header, className = "" }: PaperCardProps) {
  return (
    <Card className={`bg-white shadow-xl border-0 relative overflow-hidden ${className}`}>
      {/* 纸张边距线 */}
      <div className="absolute left-16 top-0 bottom-0 w-px bg-red-300 z-10"></div>
      <div className="absolute left-20 top-0 bottom-0 w-px bg-blue-200 z-10"></div>
      
      {/* 可选的头部区域 */}
      {header && (
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 relative z-20">
          {header}
        </CardHeader>
      )}
      
      {/* 纸张样式的内容区域 */}
      <CardContent 
        className="p-0 bg-white relative" 
        style={{
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 31px,
            #e5e7eb 31px,
            #e5e7eb 32px
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