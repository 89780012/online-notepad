'use client';

/**
 * TUI Markdown Editor - 基于 TOAST UI Editor 的 Markdown 编辑器
 * 用于替换原有的 @uiw/react-md-editor，提供 WYSIWYG 编辑体验
 */

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2, Save, Share2, FolderOpen, Download, Eraser, ChevronDown, Menu, X } from 'lucide-react';
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
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import EditorErrorBoundary from './EditorErrorBoundary';
import ImageInsertDialog from './ImageInsertDialog';
import { getTemplates, categories } from '@/data/templates';

// 引入 TUI Editor 类型
import type {
  TUIMarkdownEditorProps,
  TUIEditorRef,
  PreviewStyle,
  EditType
} from '@/types/tui-editor';

// 动态导入 TUI Editor 以避免 SSR 问题
const Editor = dynamic(
  () => import('@toast-ui/react-editor').then((mod) => ({
    default: mod.Editor
  })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Loading TUI Editor...</div>
        </div>
      </div>
    )
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

// 清除 Markdown 格式的函数 (保持与原组件一致)
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

export default function TUIMarkdownEditor({
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
  showSidebar = false,
  onToggleSidebar,
  previewStyle = 'vertical',
  initialEditType = 'wysiwyg',
  enableCodeSyntaxHighlight = true,
}: TUIMarkdownEditorProps) {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();

  // 状态管理 (保持与原组件一致)
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // 引用管理
  const editorRef = useRef<TUIEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 监听自动保存状态变化 (保持与原组件一致)
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

  // 清理定时器 (保持与原组件一致)
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

  // 🔥 核心修复：同步外部content变化到TUI Editor
  useEffect(() => {
    const editorInstance = editorRef.current?.getInstance();
    if (editorInstance && content !== undefined) {
      try {
        const currentContent = (editorInstance as { getMarkdown: () => string }).getMarkdown();
        // 只有当内容真正不同时才更新，避免无限循环
        if (currentContent !== content) {
          (editorInstance as { setMarkdown: (content: string) => void }).setMarkdown(content);
        }
      } catch (error) {
        console.error('同步外部content到TUI Editor失败:', error);
      }
    }
  }, [content]); // 监听content变化

  // 🔥 核心功能：内容变化处理
  const handleContentChange = useCallback(() => {
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    try {
      // 获取 Markdown 内容 - 使用类型断言访问 TUI Editor 方法
      const newContent = (editorInstance as { getMarkdown: () => string }).getMarkdown();

      // 调用父组件回调
      onContentChange(newContent);

      // 设置正在输入状态（用于UI反馈）
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // 1秒后清除输入状态
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('获取编辑器内容失败:', error);
    }
  }, [onContentChange]);

  // 全屏切换处理 (保持与原组件一致)
  const handleFullScreenToggle = () => {
    if (onToggleFocusMode) {
      onToggleFocusMode();
    } else {
      setIsFullScreen(!isFullScreen);
    }
  };

  // 保存处理 (保持与原组件一致)
  const handleSave = () => {
    if (onSave) {
      onSave();
      console.log('保存操作已触发');
    }
  };

  // 打开本地文件 (保持与原组件一致)
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

  // 另存为功能 (保持与原组件一致)
  const handleSaveAs = () => {
    if (onSaveAs) {
      onSaveAs(title, content);
    }
  };

  // 应用模板 - 修复：同时更新TUI Editor内容
  const handleApplyTemplate = (templateContent: string) => {
    const editorInstance = editorRef.current?.getInstance();
    if (editorInstance) {
      try {
        // 使用TUI Editor的setMarkdown方法直接设置内容
        (editorInstance as { setMarkdown: (content: string) => void }).setMarkdown(templateContent);
        // 同时通知父组件内容变化
        onContentChange(templateContent);
      } catch (error) {
        console.error('模板应用失败:', error);
        // 降级方案：仅更新父组件状态
        onContentChange(templateContent);
      }
    } else {
      // 编辑器未就绪时的降级方案
      onContentChange(templateContent);
    }
  };

  const handleImageInsert = useCallback((markdown: string) => {
    const editorInstance = editorRef.current?.getInstance();
    if (editorInstance) {
      try {
        // 解析 markdown 格式的图片
        const imageMatch = markdown.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const [, altText, imageUrl] = imageMatch;
          // 使用 TUI Editor 的图片插入 API - 类型断言
          (editorInstance as { exec: (command: string, options: unknown) => void }).exec('insertImage', {
            imageUrl: imageUrl.trim(),
            altText: altText || 'Image'
          });
        } else {
          // 如果解析失败，直接插入到当前位置
          const tuiEditor = editorInstance as {
            getMarkdown: () => string;
            setMarkdown: (content: string) => void;
            getCurrentModeEditor: () => { getSelection: () => { start: number; end: number } };
          };

          const currentContent = tuiEditor.getMarkdown();
          const cursorPosition = tuiEditor.getCurrentModeEditor().getSelection();
          const beforeCursor = currentContent.slice(0, cursorPosition.start);
          const afterCursor = currentContent.slice(cursorPosition.end);
          const newContent = beforeCursor + markdown + afterCursor;
          tuiEditor.setMarkdown(newContent);
        }

        // 触发内容变化事件
        setTimeout(handleContentChange, 100);
      } catch (error) {
        console.error('图片插入失败:', error);
        // 降级方案：直接追加内容
        const newContent = content + '\n\n' + markdown + '\n';
        onContentChange(newContent);
      }
    }
    setShowImageDialog(false);
  }, [content, onContentChange, handleContentChange]);

  // 获取模板数据 (保持与原组件一致)
  const templates = getTemplates(t);

  // 按分类分组模板
  const templatesByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  // 🎨 TUI Editor 配置
  const [editorPlugins, setEditorPlugins] = useState<unknown[]>([]);

  // 动态加载插件
  useEffect(() => {
    if (enableCodeSyntaxHighlight) {
      loadCodeSyntaxHighlight().then(plugin => {
        if (plugin) {
          setEditorPlugins([plugin]);
        }
      });
    }
  }, [enableCodeSyntaxHighlight]);

  const editorOptions = {
    height: '100%',
    initialValue: content,
    previewStyle: previewStyle as PreviewStyle,
    initialEditType: initialEditType as EditType,
    useCommandShortcut: true,
    hideModeSwitch: false,
    theme: resolvedTheme,
    plugins: editorPlugins,
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
      ['scrollSync']
    ]
    
  };

  return (
    <div className={`flex flex-col h-full ${isFocusMode ? 'h-screen' : ''}`}>
      <div className={`editor-container flex flex-col h-full ${isFocusMode ? 'border-none shadow-none rounded-none' : ''}`}>
        {/* Header 工具栏 - 保持与原组件完全一致 */}
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center gap-4 flex-1">
            {/* 侧边栏切换按钮 */}
            {onToggleSidebar && (
              <Button
                onClick={onToggleSidebar}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/80"
                title={showSidebar ? t('hideSidebar') : t('showSidebar')}
              >
                {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            )}

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

          {/* 工具栏按钮 - 保持与原组件完全一致 */}
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
              {isFocusMode ? <Minimize2 className="w-4 w-4" /> : <Maximize2 className="w-4 w-4" />}
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

        {/* 🔥 TUI Editor 核心组件 */}
        <div className="flex-1 overflow-hidden">
          <EditorErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">加载 TUI Editor 中...</div>
              </div>
            }>
              <Editor
                key={`tui-editor-${resolvedTheme}`}
                ref={editorRef}
                {...editorOptions}
                onChange={handleContentChange}
                onFocus={() => {
                  console.log('TUI Editor focused');
                }}
              />
            </Suspense>
          </EditorErrorBoundary>
        </div>

        {/* 图片插入对话框 - 保持与原组件一致 */}
        <ImageInsertDialog
          isOpen={showImageDialog}
          onClose={() => setShowImageDialog(false)}
          onInsert={handleImageInsert}
        />
      </div>
    </div>
  );
}