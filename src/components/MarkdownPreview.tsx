'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import EditorErrorBoundary from './EditorErrorBoundary';
// import 'katex/dist/katex.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

// 动态导入 MDEditor.Markdown 以避免 SSR 问题
const MarkdownRenderer = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => ({ default: mod.default.Markdown })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">
            Loading preview...
          </div>
        </div>
      </div>
    )
  }
);

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 在服务端渲染期间显示简单的文本内容
  if (!isMounted) {
    return (
      <div className={`markdown-preview ${className}`}>
        <div className="whitespace-pre-wrap text-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`markdown-preview ${className}`}>
      <EditorErrorBoundary>
        <MarkdownRenderer
          source={content}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
          }}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkMath]}
        />
      </EditorErrorBoundary>
    </div>
  );
}