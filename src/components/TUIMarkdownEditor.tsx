'use client';

/**
 * TUI Markdown Editor - 基于 TOAST UI Editor 的 Markdown 编辑器
 * 用于替换原有的 @uiw/react-md-editor，提供 WYSIWYG 编辑体验
 */

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2,Plus ,Save, Share2, FolderOpen, Download, Menu, X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
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


export default function TUIMarkdownEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onShare,
  onOpenFile,
  onSaveAs,
  onNewNote,
  isFocusMode = false,
  onToggleFocusMode,
  showSidebar = false,
  onToggleSidebar,
  previewStyle = 'vertical',
  initialEditType = 'wysiwyg',
  enableCodeSyntaxHighlight = true,
}: TUIMarkdownEditorProps) {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();

  // 状态管理
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // 引用管理
  const editorRef = useRef<TUIEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);


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

  // 清理定时器，避免内存泄漏
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 🔥 核心功能：内容变化处理（带防抖）
  const handleContentChange = useCallback(() => {

    if(!title){
      return; //没有标题不保存
    }

    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    try {
      // 获取 Markdown 内容
      const newContent = (editorInstance as { getMarkdown: () => string }).getMarkdown();
      
      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置正在自动保存状态
      setIsAutoSaving(true);

      // 设置新的防抖定时器，3秒后执行
      debounceTimerRef.current = setTimeout(() => {
        // 调用父组件回调
        onContentChange(newContent);
        
        // 设置自动保存完成
        setIsAutoSaving(false);
        
        // 更新最后保存时间
        setLastSaveTime(new Date());
        
        // 清除定时器引用
        debounceTimerRef.current = null;
      }, 1000);

    } catch (error) {
      console.error('获取编辑器内容失败:', error);
      setIsAutoSaving(false);
    }
  }, [onContentChange,title]);

  // 全屏切换处理 (保持与原组件一致)
  const handleFullScreenToggle = () => {
    if (onToggleFocusMode) {
      onToggleFocusMode();
    } else {
      setIsFullScreen(!isFullScreen);
    }
  };

  // 保存处理 - 更新最后保存时间
  const handleSave = () => {
    if (onSave) {
      onSave();
      // 手动保存时更新最后保存时间
      setLastSaveTime(new Date());
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

  // 打印功能 - 将 Markdown 内容转换为 HTML 并打印
  const handlePrint = () => {
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    try {
      // 获取编辑器的 HTML 内容（TUI Editor 的预览内容）
      const htmlContent = (editorInstance as { getHTML: () => string }).getHTML();
      
      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert(t('printBlocked') || 'Please allow pop-ups to enable printing');
        return;
      }

      // 构建打印页面的 HTML
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title || t('untitled')}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 2cm;
                max-width: 21cm;
                margin: 0 auto;
                background: white;
              }
              
              h1 {
                font-size: 2em;
                margin-bottom: 0.5em;
                padding-bottom: 0.3em;
                border-bottom: 2px solid #eee;
              }
              
              h2 {
                font-size: 1.5em;
                margin-top: 1em;
                margin-bottom: 0.5em;
                padding-bottom: 0.2em;
                border-bottom: 1px solid #eee;
              }
              
              h3 {
                font-size: 1.25em;
                margin-top: 0.8em;
                margin-bottom: 0.4em;
              }
              
              p {
                margin-bottom: 1em;
              }
              
              ul, ol {
                margin-left: 2em;
                margin-bottom: 1em;
              }
              
              li {
                margin-bottom: 0.3em;
              }
              
              code {
                background: #f5f5f5;
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-family: 'Courier New', Courier, monospace;
                font-size: 0.9em;
              }
              
              pre {
                background: #f5f5f5;
                padding: 1em;
                border-radius: 5px;
                overflow-x: auto;
                margin-bottom: 1em;
              }
              
              pre code {
                background: none;
                padding: 0;
              }
              
              blockquote {
                border-left: 4px solid #ddd;
                padding-left: 1em;
                margin-left: 0;
                margin-bottom: 1em;
                color: #666;
              }
              
              table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 1em;
              }
              
              th, td {
                border: 1px solid #ddd;
                padding: 0.5em;
                text-align: left;
              }
              
              th {
                background: #f5f5f5;
                font-weight: bold;
              }
              
              img {
                max-width: 100%;
                height: auto;
                margin-bottom: 1em;
              }
              
              hr {
                border: none;
                border-top: 1px solid #ddd;
                margin: 1.5em 0;
              }
              
              a {
                color: #0066cc;
                text-decoration: none;
              }
              
              a:hover {
                text-decoration: underline;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                
                @page {
                  margin: 2cm;
                }
              }
            </style>
          </head>
          <body>
            <h1>${title || t('untitled')}</h1>
            ${htmlContent}
          </body>
        </html>
      `;

      // 写入内容到新窗口
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();

      // 等待内容加载完成后打印
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // 打印完成后关闭窗口
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };

    } catch (error) {
      console.error('打印失败:', error);
      alert(t('printFailed') || 'Print failed. Please try again.');
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
        {/* Header 工具栏 - 现代化菜单栏布局 */}
        <div className="flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          {/* 第一行：优雅的菜单栏 */}
          <div className="flex items-center justify-between h-10 px-4 border-b border-border/40">
            <div className="flex items-center gap-0.5">
              {/* 侧边栏切换 */}
              {onToggleSidebar && (
                <Button
                  onClick={onToggleSidebar}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  title={showSidebar ? t('hideSidebar') : t('showSidebar')}
                >
                  {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              )}

              <div className="w-px h-4 bg-border/60 mx-1.5"></div>

              {/* File 菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {t('file') || '文件'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 shadow-lg">
                  <DropdownMenuItem onClick={onNewNote} className="cursor-pointer gap-3 py-2.5">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('newNote')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenFile} className="cursor-pointer gap-3 py-2.5">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('openFile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSave} className="cursor-pointer gap-3 py-2.5">
                    <Save className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('save')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAs} className="cursor-pointer gap-3 py-2.5">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span>{t('saveAs')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handlePrint} className="cursor-pointer gap-3 py-2.5">
                    <Printer className="w-4 h-4 text-muted-foreground" />
                    <span>{t('print')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Insert 菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {t('insert') || '插入'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 max-h-[32rem] overflow-y-auto shadow-lg">
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('selectTemplate')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories
                    .filter(category => category.id !== 'all')
                    .map((category) => {
                      const categoryTemplates = templatesByCategory[category.id];
                      if (!categoryTemplates || categoryTemplates.length === 0) return null;

                      const Icon = category.icon;
                      return (
                        <div key={category.id}>
                          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-2 mb-1">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{t(category.name)}</span>
                          </DropdownMenuLabel>
                          {categoryTemplates.map((template) => {
                            const TemplateIcon = template.icon;
                            return (
                              <DropdownMenuItem
                                key={template.id}
                                onClick={() => handleApplyTemplate(template.content)}
                                className="cursor-pointer py-2.5 pl-8"
                              >
                                <div className="flex items-start gap-3 w-full">
                                  <TemplateIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{t(template.name)}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {t(template.description)}
                                    </div>
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            );
                          })}
                          <DropdownMenuSeparator className="my-1" />
                        </div>
                      );
                    })
                  }
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View 菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {t('view') || '视图'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 shadow-lg">
                  <DropdownMenuItem 
                    onClick={handleFullScreenToggle} 
                    className="cursor-pointer gap-3 py-2.5"
                  >
                    {isFocusMode ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-muted-foreground" />
                        <span>{t('exitFocusMode')}</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-muted-foreground" />
                        <span>{t('enterFocusMode')}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  {onToggleSidebar && (
                    <DropdownMenuItem 
                      onClick={onToggleSidebar} 
                      className="cursor-pointer gap-3 py-2.5"
                    >
                      {showSidebar ? (
                        <>
                          <X className="w-4 h-4 text-muted-foreground" />
                          <span>{t('hideSidebar')}</span>
                        </>
                      ) : (
                        <>
                          <Menu className="w-4 h-4 text-muted-foreground" />
                          <span>{t('showSidebar')}</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-4 bg-border/60 mx-1.5"></div>

              {/* Share 按钮 - 强调样式 */}
              <Button 
                onClick={onShare}
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-sm font-medium text-primary hover:text-primary hover:bg-primary/10 transition-colors gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('share') || '分享'}</span>
              </Button>
            </div>

            {/* 右侧：优雅的保存状态指示 */}
            <div className="flex items-center gap-3 pr-2">
              {(isAutoSaving ) ? (
                <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>{t('autoSaving')}</span>
                </div>
              ) : lastSaveTime ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>{t('lastSaved')}: {lastSaveTime.toLocaleTimeString('zh-CN', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* 第二行：简洁优雅的标题区域 */}
          <div className="group px-8 py-4 hover:bg-accent/20 transition-colors duration-200">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={t('enterTitle')}
              className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 text-foreground transition-all duration-200 hover:placeholder:text-muted-foreground/50 focus:placeholder:text-muted-foreground/50"
              style={{
                caretColor: 'hsl(var(--primary))',
              }}
            />
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

      </div>
    </div>
  );
}