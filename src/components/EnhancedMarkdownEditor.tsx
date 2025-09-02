'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Code, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  EyeOff,
  Split,
  Maximize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

type ViewMode = 'edit' | 'preview' | 'split';

export default function MarkdownEditor({ title, content, onTitleChange, onContentChange, isFocusMode = false, onToggleFocusMode }: MarkdownEditorProps) {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 插入文本的通用函数
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = selectedText || placeholder;
    
    const newText = content.substring(0, start) + before + replacement + after + content.substring(end);
    onContentChange(newText);
    
    // 重新设置光标位置
    setTimeout(() => {
      const newCursorPos = start + before.length + replacement.length + after.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 工具栏按钮配置
  const toolbarButtons = [
    {
      icon: Heading1,
      title: '一级标题',
      action: () => insertText('# ', '', '标题')
    },
    {
      icon: Heading2,
      title: '二级标题',
      action: () => insertText('## ', '', '标题')
    },
    {
      icon: Heading3,
      title: '三级标题',
      action: () => insertText('### ', '', '标题')
    },
    {
      icon: Bold,
      title: '粗体',
      action: () => insertText('**', '**', '粗体文本')
    },
    {
      icon: Italic,
      title: '斜体',
      action: () => insertText('*', '*', '斜体文本')
    },
    {
      icon: Code,
      title: '行内代码',
      action: () => insertText('`', '`', '代码')
    },
    {
      icon: Link,
      title: '链接',
      action: () => insertText('[', '](url)', '链接文本')
    },
    {
      icon: List,
      title: '无序列表',
      action: () => insertText('- ', '', '列表项')
    },
    {
      icon: ListOrdered,
      title: '有序列表',
      action: () => insertText('1. ', '', '列表项')
    },
    {
      icon: Quote,
      title: '引用',
      action: () => insertText('> ', '', '引用内容')
    }
  ];

  // 专注模式渲染 - 保持边框样式
  if (isFocusMode) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* 标题输入 */}
        <div className="mb-6">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('noteTitle') || '输入标题...'}
            className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
          />
        </div>

        {/* 简化工具栏 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md border border-border">
            {toolbarButtons.slice(0, 6).map((btn, index) => (
              <Button
                key={`focus-toolbar-btn-${index}`}
                variant="ghost"
                size="sm"
                onClick={btn.action}
                title={btn.title}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* 全屏编辑器 - 保持边框 */}
        <div className="flex-1 border border-border rounded-md overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={t('writeNote') || '开始写作...'}
            className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 p-4 text-lg bg-transparent leading-relaxed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 标题输入 */}
      <div className="mb-6">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('noteTitle') || '输入标题...'}
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
        />
      </div>

      {/* Markdown工具栏 */}
      <div className="border border-border rounded-t-md bg-muted/30">
        {/* 格式工具栏 */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-1">
            {toolbarButtons.map((btn, index) => (
              <Button
                key={`toolbar-btn-${index}`}
                variant="ghost"
                size="sm"
                onClick={btn.action}
                title={btn.title}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          
          {/* 视图模式切换 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFocusMode}
              title="专注模式"
              className="h-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              title="编辑模式"
              className="h-8"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              title="分屏模式"
              className="h-8"
            >
              <Split className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              title="预览模式"
              className="h-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="border border-t-0 border-border rounded-b-md">
        {viewMode === 'edit' && (
          <div className="p-4">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={t('writeNote') || '开始写作...'}
              className="min-h-[400px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base"
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="p-4 min-h-[400px] bg-card">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-foreground border-b pb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 text-foreground border-b pb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-medium mb-2 text-foreground">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto mb-4 border">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic mb-4 text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-foreground">{children}</li>,
                }}
              >
                {content || '# 预览\n\n在编辑器中输入 Markdown 内容，这里将显示渲染结果。'}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="flex">
            {/* 左侧编辑器 */}
            <div className="flex-1 p-4 border-r border-border">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder={t('writeNote') || '开始写作...'}
                className="min-h-[400px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base"
              />
            </div>
            
            {/* 右侧预览 */}
            <div className="flex-1 p-4 bg-card/30">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 text-foreground border-b pb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground border-b pb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed text-sm">{children}</p>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>
                      ) : (
                        <code className={className}>{children}</code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-3 border text-xs">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-3 italic mb-3 text-muted-foreground text-sm">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground text-sm">{children}</li>,
                  }}
                >
                  {content || '# 预览\n\n实时预览 Markdown 渲染结果。'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}