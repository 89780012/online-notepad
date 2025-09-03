'use client';

import { useState, useCallback, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Maximize2, Minimize2, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.css';

interface NewMarkdownEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  onShare?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export default function NewMarkdownEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onShare,
  isFocusMode = false,
  onToggleFocusMode,
}: NewMarkdownEditorProps) {
  // 移除未使用的 t 变量
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleContentChange = useCallback((value?: string) => {
    onContentChange(value || '');
  }, [onContentChange]);

  const handleFullScreenToggle = () => {
    if (onToggleFocusMode) {
      onToggleFocusMode();
    } else {
      setIsFullScreen(!isFullScreen);
    }
  };

  // 检测标题变化，自动显示保存按钮
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [title, content]);

  const handleSave = () => {
    if (onSave) {
      onSave();
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFocusMode ? 'h-screen' : ''}`}>
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
            placeholder="请输入标题..."
            className="flex-1 max-w-md border-none bg-transparent text-lg font-semibold focus:ring-0"
          />
          
          {/* 新笔记提示 */}
          {hasUnsavedChanges && (
            <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              有未保存的更改
            </div>
          )}
        </div>
        
        {/* 工具栏按钮 */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            size="sm"
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </Button>
          
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            分享
          </Button>
          
          <Button
            onClick={handleFullScreenToggle}
            variant="ghost"
            size="sm"
            title={isFocusMode ? "退出专注模式" : "进入专注模式"}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Markdown 编辑器 */}
      <div className="flex-1 overflow-hidden">
        <MDEditor
          value={content}
          onChange={handleContentChange}
          height="100%"
          preview="live"
          hideToolbar={false}
          data-color-mode="auto"
          previewOptions={{
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          }}
          textareaProps={{
            placeholder: '开始编写你的 Markdown 内容...\n\n支持：\n- 基本 Markdown 语法\n- 数学公式 $\\LaTeX$ 和 $$\\LaTeX$$\n- 代码高亮\n- 表格、列表等',
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
          }}
        />
      </div>
    </div>
  );
}