'use client';
import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2,Plus ,Save, Share2, FolderOpen, Download, Menu, X, Printer, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import EditorErrorBoundary from './EditorErrorBoundary';
import { getTemplates, categories } from '@/data/templates';
import { printMarkdownContent } from '@/lib/print-utils';
import BackgroundMusicPlayer from './BackgroundMusicPlayer';
import PaperColorSelector from './PaperColorSelector';

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
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

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

  // 全屏切换处理 (移到前面以避免依赖错误)
  const handleFullScreenToggle = useCallback(() => {
    if (onToggleFocusMode) {
      onToggleFocusMode();
    } else {
      setIsFullScreen(!isFullScreen);
    }
  }, [onToggleFocusMode, isFullScreen]);

  // 打开本地文件
  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 打印功能
  const handlePrint = useCallback(() => {
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    try {
      const htmlContent = (editorInstance as { getHTML: () => string }).getHTML();
      printMarkdownContent({
        title: title || t('untitled') || 'Untitled',
        htmlContent,
        onError: (error) => {
          console.error('打印初始化失败:', error);
          if (error.message.includes('无法') || error.message.includes('failed')) {
            alert(t('printFailed') || 'Print initialization failed. Please try again.');
          }
        }
      });
    } catch (error) {
      console.error('打印失败:', error);
      alert(t('printFailed') || 'Print failed. Please try again.');
    }
  }, [title, t]);

  // 🔥 快捷键监听：完整的快捷键系统
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl+S / Cmd+S: 保存
      if (modKey && !event.shiftKey && !event.altKey && event.key === 's') {
        event.preventDefault();
        if (onSave) {
          onSave();
          setLastSaveTime(new Date());
          console.log('快捷键保存已触发');
        }
        return;
      }

      // Alt+N: 新建笔记（避免与浏览器Ctrl+N冲突）
      if (event.altKey && !modKey && !event.shiftKey && event.key === 'n') {
        event.preventDefault();
        if (onNewNote) {
          onNewNote();
          console.log('快捷键新建笔记已触发 (Alt+N)');
        }
        return;
      }

      // Alt+O: 打开文件（避免与浏览器Ctrl+O冲突）
      if (event.altKey && !modKey && !event.shiftKey && event.key === 'o') {
        event.preventDefault();
        handleOpenFile();
        console.log('快捷键打开文件已触发 (Alt+O)');
        return;
      }

      // Ctrl+P / Cmd+P: 打印
      if (modKey && !event.shiftKey && event.key === 'p') {
        event.preventDefault();
        handlePrint();
        console.log('快捷键打印已触发');
        return;
      }

      // F11: 专注模式（Windows/Linux常用）
      if (event.key === 'F11') {
        event.preventDefault();
        handleFullScreenToggle();
        console.log('快捷键切换专注模式已触发 (F11)');
        return;
      }

      // Ctrl+B / Cmd+B: 切换侧边栏
      if (modKey && !event.shiftKey && event.key === 'b') {
        event.preventDefault();
        if (onToggleSidebar) {
          onToggleSidebar();
          console.log('快捷键切换侧边栏已触发');
        }
        return;
      }

      // Ctrl+Shift+S / Cmd+Shift+S: 分享
      if (modKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        if (onShare) {
          onShare();
          console.log('快捷键分享已触发');
        }
        return;
      }

      // Ctrl+/ / Cmd+/: 快捷键帮助
      if (modKey && event.key === '/') {
        event.preventDefault();
        setShowShortcutsDialog(true);
        console.log('快捷键帮助已打开');
        return;
      }

    };

    // 添加事件监听
    window.addEventListener('keydown', handleKeyDown);

    // 清理事件监听
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave, onNewNote, onShare, onToggleSidebar, handleFullScreenToggle]); // 依赖所有回调

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

  // 保存处理 - 更新最后保存时间
  const handleSave = () => {
    if (onSave) {
      onSave();
      // 手动保存时更新最后保存时间
      setLastSaveTime(new Date());
      console.log('保存操作已触发');
    }
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
                <DropdownMenuContent align="start" className="w-64 shadow-lg">
                  <DropdownMenuItem onClick={onNewNote} className="cursor-pointer gap-3 py-2.5">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('newNote')}</span>
                    <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Alt+N
                    </kbd>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenFile} className="cursor-pointer gap-3 py-2.5">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('openFile')}</span>
                    <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Alt+O
                    </kbd>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSave} className="cursor-pointer gap-3 py-2.5">
                    <Save className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('save')}</span>
                    <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘S' : 'Ctrl+S'}
                    </kbd>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAs} className="cursor-pointer gap-3 py-2.5">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('saveAs')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handlePrint} className="cursor-pointer gap-3 py-2.5">
                    <Printer className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('print')}</span>
                    <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘P' : 'Ctrl+P'}
                    </kbd>
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
                <DropdownMenuContent align="start" className="w-64 shadow-lg">
                  <DropdownMenuItem 
                    onClick={handleFullScreenToggle} 
                    className="cursor-pointer gap-3 py-2.5"
                  >
                    {isFocusMode ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1">{t('exitFocusMode')}</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1">{t('enterFocusMode')}</span>
                      </>
                    )}
                    <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      F11
                    </kbd>
                  </DropdownMenuItem>
                  {onToggleSidebar && (
                    <DropdownMenuItem 
                      onClick={onToggleSidebar} 
                      className="cursor-pointer gap-3 py-2.5"
                    >
                      {showSidebar ? (
                        <>
                          <X className="w-4 h-4 text-muted-foreground" />
                          <span className="flex-1">{t('hideSidebar')}</span>
                        </>
                      ) : (
                        <>
                          <Menu className="w-4 h-4 text-muted-foreground" />
                          <span className="flex-1">{t('showSidebar')}</span>
                        </>
                      )}
                      <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘B' : 'Ctrl+B'}
                      </kbd>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Music 菜单 */}
              <BackgroundMusicPlayer />

              {/* Paper Color 选择器 */}
              <PaperColorSelector />

              <div className="w-px h-4 bg-border/60 mx-1.5"></div>

              {/* Share 按钮 - 强调样式 */}
              <Button 
                onClick={onShare}
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-sm font-medium text-primary hover:text-primary hover:bg-primary/10 transition-colors gap-2"
                title={`${t('share')} (${navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘⇧S' : 'Ctrl+Shift+S'})`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('share') || '分享'}</span>
              </Button>

              <div className="w-px h-4 bg-border/60 mx-1.5"></div>

              {/* Help 菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {t('help') || '帮助'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 shadow-lg">
                  <DropdownMenuItem 
                    onClick={() => setShowShortcutsDialog(true)} 
                    className="cursor-pointer gap-3 py-2.5"
                  >
                    <Keyboard className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{t('keyboardShortcuts') || '键盘快捷键'}</span>
                    <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘/' : 'Ctrl+/'}
                    </kbd>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

      {/* 🎹 快捷键帮助对话框 */}
      <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Keyboard className="w-5 h-5" />
              {t('keyboardShortcuts') || '键盘快捷键'}
            </DialogTitle>
            <DialogDescription>
              {t('shortcutsDescription') || '使用快捷键提升编辑效率'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* 文件操作 */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t('fileOperations') || '文件操作'}
              </h3>
              <div className="space-y-2">
                <ShortcutItem 
                  shortcut="Alt + N"
                  description={t('newNote') || '新建笔记'}
                />
                <ShortcutItem 
                  shortcut="Alt + O"
                  description={t('openFile') || '打开文件'}
                />
                <ShortcutItem 
                  shortcut={navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘ S' : 'Ctrl + S'}
                  description={t('save') || '保存'}
                  highlight
                />
                <ShortcutItem 
                  shortcut={navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘ P' : 'Ctrl + P'}
                  description={t('print') || '打印'}
                />
              </div>
            </div>

            {/* 视图操作 */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t('viewOperations') || '视图操作'}
              </h3>
              <div className="space-y-2">
                <ShortcutItem 
                  shortcut="F11"
                  description={t('toggleFocusMode') || '切换专注模式'}
                />
                <ShortcutItem 
                  shortcut={navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘ B' : 'Ctrl + B'}
                  description={t('toggleSidebar') || '切换侧边栏'}
                />
              </div>
            </div>

            {/* 分享与帮助 */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t('otherOperations') || '其他操作'}
              </h3>
              <div className="space-y-2">
                <ShortcutItem 
                  shortcut={navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘ ⇧ S' : 'Ctrl + Shift + S'}
                  description={t('share') || '分享笔记'}
                />
                <ShortcutItem 
                  shortcut={navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘ /' : 'Ctrl + /'}
                  description={t('showShortcuts') || '显示快捷键帮助'}
                />
              </div>
            </div>

            {/* 快捷键说明 */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground">
                ℹ️ {t('shortcutsNote') || '注意：部分快捷键使用 Alt 组合避免与浏览器默认快捷键冲突。'}
              </p>
              <p className="text-xs text-muted-foreground">
                💡 {t('editorShortcutsHint') || 'TUI Editor 还支持更多编辑器内置快捷键（如 Ctrl+B 加粗、Ctrl+I 斜体等），请在编辑器中探索使用。'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 快捷键项组件
function ShortcutItem({ 
  shortcut, 
  description, 
  highlight = false 
}: { 
  shortcut: string; 
  description: string; 
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
      highlight ? 'bg-primary/5 border border-primary/20' : 'hover:bg-accent/50'
    }`}>
      <span className="text-sm text-foreground">{description}</span>
      <kbd className={`text-xs font-mono px-2 py-1 rounded ${
        highlight 
          ? 'bg-primary/10 text-primary border border-primary/30' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {shortcut}
      </kbd>
    </div>
  );
}