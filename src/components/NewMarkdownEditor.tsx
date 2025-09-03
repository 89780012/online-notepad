'use client';

import { useState, useCallback, useRef, useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2, Save, Share2, FolderOpen, Download, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { debounce } from 'lodash';
import 'katex/dist/katex.css';

// 动态导入 MDEditor 以避免 SSR 问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">加载编辑器中...</div>
      </div>
    )
  }
);

// 创建多语言模板的函数
const createNoteTemplate = (t: (key: string) => string, locale: string) => `# ${t('newNoteTitle')}

## ${t('overview')}
${t('writeYourThoughts')}

## ${t('keyPoints')}
- ${t('firstPoint')}
- ${t('secondPoint')}
- ${t('thirdPoint')}

## ${t('codeExample')}
\`\`\`javascript
${t('addCodeHere')}
console.log('Hello, World!');
\`\`\`

## ${t('mathFormula')}
${t('useLatexSyntax')} $E = mc^2$

## ${t('taskList')}
- [ ] ${t('pendingTask1')}
- [ ] ${t('pendingTask2')}
- [x] ${t('completedTask')}

## ${t('linkText')}
[${t('linkText')}](https://example.com)

---
*${t('createdAt')} ${new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}*
`;

// 清除 Markdown 格式的函数
const stripMarkdown = (text: string): string => {
  return text
    // 移除标题
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体和斜体
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 移除删除线
    .replace(/~~([^~]+)~~/g, '$1')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // 移除链接
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除引用
    .replace(/^>\s+/gm, '')
    // 移除列表标记
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 移除任务列表
    .replace(/^[\s]*-\s+\[[x\s]\]\s+/gm, '')
    // 移除水平线
    .replace(/^---+$/gm, '')
    // 移除多余的空行
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

interface NewMarkdownEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  onShare?: () => void;
  onOpenFile?: (title: string, content: string) => void;
  onSaveAs?: (title: string, content: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isAutoSaving?: boolean;
  onClearMarkdown?: () => void;
  onUseTemplate?: () => void;
}

export default function NewMarkdownEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onShare,
  onOpenFile,
  onSaveAs,
  isFocusMode = false,
  onToggleFocusMode,
  isAutoSaving = false,
  onClearMarkdown,
  onUseTemplate,
}: NewMarkdownEditorProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 使用防抖优化性能，减少频繁的重新渲染
  const debouncedContentChange = useMemo(
    () => debounce((value: string) => {
      onContentChange(value);
    }, 300),
    [onContentChange]
  );

  // 监听自动保存状态变化
  useEffect(() => {
    if (isAutoSaving) {
      setShowSaveStatus(true);
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    } else if (showSaveStatus) {
      // 保存完成后，显示"已保存"状态3秒
      saveStatusTimeoutRef.current = setTimeout(() => {
        setShowSaveStatus(false);
      }, 3000);
    }
  }, [isAutoSaving, showSaveStatus]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleContentChange = useCallback((value?: string) => {
    const newValue = value || '';

    // 使用防抖处理内容变化，提高性能
    debouncedContentChange(newValue);

    // 设置正在输入状态
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 1秒后清除输入状态
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, [debouncedContentChange]);

  const handleFullScreenToggle = () => {
    if (onToggleFocusMode) {
      onToggleFocusMode();
    } else {
      setIsFullScreen(!isFullScreen);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      // 给用户一个视觉反馈，表示保存操作已经触发
      console.log('保存操作已触发');
    }
  };

  // 打开本地文件
  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 移除文件扩展名
        
        if (onOpenFile) {
          onOpenFile(fileName, fileContent);
        }
      };
      reader.readAsText(file);
    }
    // 重置文件输入
    event.target.value = '';
  };

  // 另存为功能
  const handleSaveAs = () => {
    if (onSaveAs) {
      onSaveAs(title, content);
    }
  };

  // 清除 Markdown 格式
  const handleClearMarkdown = () => {
    if (onClearMarkdown) {
      const plainText = stripMarkdown(content);
      onContentChange(plainText);
      onClearMarkdown();
    }
  };

  // 使用模板
  const handleUseTemplate = () => {
    if (onUseTemplate) {
      const template = createNoteTemplate(t, locale);
      onContentChange(template);
      onUseTemplate();
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFocusMode ? 'h-screen' : ''}`}>
      <div className={`editor-container flex flex-col h-full ${isFocusMode ? 'border-none shadow-none rounded-none' : ''}`}>
        {/* Header 工具栏 */}
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-4 flex-1">
          {/* 装饰性指示器 */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
          </div>
          
          {/* 标题输入 */}
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('enterTitle')}
            className="flex-1 max-w-md border-none bg-transparent text-lg font-semibold focus:ring-0"
          />
          
          {/* 状态提示 */}
          {isTyping ? (
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
              {t('typing')}
            </div>
          ) : showSaveStatus && (
            <>
              {isAutoSaving ? (
                <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  {t('autoSaving')}
                </div>
              ) : (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('allChangesSaved')}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* 工具栏按钮 */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleUseTemplate}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title={t('useTemplateTitle')}
          >
            📝 {t('useTemplate')}
          </Button>

          <Button
            onClick={handleClearMarkdown}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title={t('clearMarkdownTitle')}
          >
            <Eraser className="w-4 h-4" />
            {t('clearMarkdown')}
          </Button>

          <Button
            onClick={handleOpenFile}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title={t('openFile')}
          >
            <FolderOpen className="w-4 h-4" />
            {t('openFile')}
          </Button>

          <Button
            onClick={handleSaveAs}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title={t('saveAs')}
          >
            <Download className="w-4 h-4" />
            {t('saveAs')}
          </Button>

          <Button
            onClick={handleSave}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {t('save')}
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {t('share')}
          </Button>
          
          <Button
            onClick={handleFullScreenToggle}
            variant="ghost"
            size="sm"
            title={isFocusMode ? t('exitFocusMode') : t('enterFocusMode')}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".md,.txt,.markdown"
        style={{ display: 'none' }}
      />
      
      {/* Markdown 编辑器 */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">加载编辑器中...</div>
          </div>
        }>
          <MDEditor
            value={content}
            onChange={handleContentChange}
            height="100%"
            preview="live"
            hideToolbar={false}
            previewOptions={{
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
              // 性能优化：限制预览更新频率
              skipHtml: false,
            }}
            textareaProps={{
              placeholder: t('markdownPlaceholder'),
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                // 性能优化：减少重绘
                willChange: 'contents',
              },
              // 性能优化：减少DOM操作
              spellCheck: false,
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'off',
            }}
            // 性能优化：隐藏拖拽条
            visibleDragbar={false}
            // 动态主题支持
            data-color-mode={resolvedTheme}
          />
        </Suspense>
      </div>
      </div>
    </div>
  );
}