'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2, Save, Share2, FolderOpen, Download, Eraser, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import EditorErrorBoundary from './EditorErrorBoundary';
import { getTemplates, categories } from '@/data/templates';
import 'katex/dist/katex.css';
import { getCommands } from '@uiw/react-md-editor/commands-cn';
import {  codeEdit, codeLive, codePreview } from '@uiw/react-md-editor';

// 动态导入 MDEditor 以避免 SSR 问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Loading Markdown Editor...</div>
        </div>
      </div>
    )
  }
);

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
}: NewMarkdownEditorProps) {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // 简化的内容变化处理，直接调用父组件的回调
  const handleContentChange = useCallback((value?: string) => {
    const newValue = value || '';

    // 直接调用父组件的回调，不做防抖处理
    onContentChange(newValue);

    // 设置正在输入状态（用于UI反馈）
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 1秒后清除输入状态
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, [onContentChange]);

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

  // 应用模板
  const handleApplyTemplate = (templateContent: string) => {
    onContentChange(templateContent);
  };

  // 获取模板数据
  const templates = getTemplates(t);
  
  // 按分类分组模板
  const templatesByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

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
          {/* 模板选择下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                📝 {t('useTemplate')}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>{t('selectTemplate')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {categories
                .filter(category => category.id !== 'all')
                .map((category) => {
                  const categoryTemplates = templatesByCategory[category.id];
                  if (!categoryTemplates || categoryTemplates.length === 0) return null;

                  const Icon = category.icon;
                  return (
                    <div key={category.id}>
                      <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Icon className="w-3 h-3" />
                        {t(category.name)}
                      </DropdownMenuLabel>
                      {categoryTemplates.map((template) => {
                        const TemplateIcon = template.icon;
                        return (
                          <DropdownMenuItem
                            key={template.id}
                            onClick={() => handleApplyTemplate(template.content)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <TemplateIcon className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{t(template.name)}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {t(template.description)}
                                </div>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator />
                    </div>
                  );
                })
              }
            </DropdownMenuContent>
          </DropdownMenu>

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
        <EditorErrorBoundary>
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
              commands={[...getCommands()]} // 基础命令（加粗、斜体等）
              extraCommands={[codeEdit, codeLive, codePreview ]} // 扩展命令（表格、任务列表等）
              textareaProps={{
                placeholder: t('markdownPlaceholder'),
                style: {
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  // 性能优化：减少重绘
                  // willChange: 'contents',
                },
                // 性能优化：减少DOM操作
                // spellCheck: false,
                // autoComplete: 'off',
                // autoCorrect: 'off',
                // autoCapitalize: 'off',
              }}
              // 性能优化：隐藏拖拽条
              // visibleDragbar={false}
              // 动态主题支持
              data-color-mode={resolvedTheme}
            />
          </Suspense>
        </EditorErrorBoundary>
      </div>
      </div>
    </div>
  );
}