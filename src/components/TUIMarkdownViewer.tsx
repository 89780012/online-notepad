'use client';

/**
 * TUI Markdown Viewer - 基于 TOAST UI Editor 的纯预览组件
 * 用于分享页面等只需要渲染 Markdown 内容的场景
 * 与 TUIMarkdownEditor 保持一致的渲染效果
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import EditorErrorBoundary from './EditorErrorBoundary';

// 引入 TUI Editor 类型
import type { TUIEditorRef } from '@/types/tui-editor';

interface TUIMarkdownViewerProps {
  content: string;
  className?: string;
}

// 加载组件
const ViewerLoadingFallback = () => {
  const t = useTranslations();
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <div className="text-sm text-muted-foreground">{t('loading')}</div>
      </div>
    </div>
  );
};

// 动态导入 TUI Editor Viewer 以避免 SSR 问题
const Viewer = dynamic(
  () => import('@toast-ui/react-editor').then((mod) => ({
    default: mod.Viewer
  })),
  {
    ssr: false,
    loading: () => <ViewerLoadingFallback />
  }
);

// 动态导入代码语法高亮插件
let codeSyntaxHighlightPlugin: unknown = null;

// 异步加载插件
const loadCodeSyntaxHighlight = async () => {
  if (!codeSyntaxHighlightPlugin) {
    try {
      const pluginModule = await import('@toast-ui/editor-plugin-code-syntax-highlight');
      codeSyntaxHighlightPlugin = pluginModule.default;
    } catch (error) {
      console.warn('代码语法高亮插件加载失败:', error);
    }
  }
  return codeSyntaxHighlightPlugin;
};

export default function TUIMarkdownViewer({
  content,
  className = ''
}: TUIMarkdownViewerProps) {
  const { resolvedTheme } = useTheme();
  const viewerRef = useRef<TUIEditorRef>(null);

  // 插件状态
  const [viewerPlugins, setViewerPlugins] = useState<unknown[]>([]);

  // 动态加载插件
  useEffect(() => {
    loadCodeSyntaxHighlight().then(plugin => {
      if (plugin) {
        setViewerPlugins([plugin]);
      }
    });
  }, []);

  // 🔥 同步内容变化到TUI Viewer
  useEffect(() => {
    const viewerInstance = viewerRef.current?.getInstance();
    if (viewerInstance && content !== undefined) {
      try {
        // 使用 TUI Editor Viewer 的 setMarkdown 方法更新内容
        (viewerInstance as { setMarkdown: (content: string) => void }).setMarkdown(content);
      } catch (error) {
        console.error('同步内容到TUI Viewer失败:', error);
      }
    }
  }, [content]);

  // 🎨 TUI Viewer 配置
  const viewerOptions = {
    initialValue: content || '',
    theme: resolvedTheme,
    plugins: viewerPlugins,
  };

  return (
    <div className={`tui-markdown-viewer ${className}`}>
      <EditorErrorBoundary>
        <Viewer
          key={`tui-viewer-${resolvedTheme}`}
          ref={viewerRef}
          {...viewerOptions}
        />
      </EditorErrorBoundary>
    </div>
  );
}