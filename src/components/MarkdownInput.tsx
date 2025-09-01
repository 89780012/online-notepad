'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Split } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownInputProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

type ViewMode = 'edit' | 'preview' | 'split';

export default function MarkdownInput({ title, content, onTitleChange, onContentChange }: MarkdownInputProps) {
  const t = useTranslations();
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整textarea高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(512, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      adjustTextareaHeight();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
    requestAnimationFrame(() => {
      adjustTextareaHeight();
    });
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      
      const tabChar = '  ';
      const newValue = target.value.substring(0, start) + tabChar + target.value.substring(end);
      
      if (target === textareaRef.current) {
        onContentChange(newValue);
      } else {
        onTitleChange(newValue);
      }
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + tabChar.length;
      }, 0);
    }
  };

  return (
    <>
      {/* 标题输入区域 */}
      <div className="relative mb-8 h-16">
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          placeholder=""
          className="absolute inset-0 w-full h-full bg-transparent !border-0 !outline-0 !ring-0 !shadow-none focus:!border-0 focus:!outline-0 focus:!ring-0 focus:!shadow-none rounded-none p-0 m-0 text-2xl font-bold text-foreground font-mono pl-20 pr-4 py-4"
          style={{ 
            lineHeight: '32px',
            fontSize: '32px',
            caretColor: 'hsl(var(--primary))',
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important',
          }}
        />
        
        {/* 标题占位提示 */}
        {!title && !titleFocused && (
          <div className="absolute top-4 left-24 text-lg text-muted-foreground opacity-60 pointer-events-none font-mono">
            {t('noteTitle')}
          </div>
        )}
      </div>

      {/* Markdown工具栏 */}
      <div className="flex items-center justify-between mb-4 pl-20">
        <div className="text-sm text-muted-foreground">
          Markdown 编辑器 - 支持 GFM 语法
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('edit')}
            title="编辑模式"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
            title="分屏模式"
          >
            <Split className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            title="预览模式"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* 内容编辑区域 */}
      <div className="relative">
        {viewMode === 'edit' && (
          <>
            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setContentFocused(true)}
              onBlur={() => setContentFocused(false)}
              placeholder=""
              className="w-full bg-transparent !border-0 !outline-0 !ring-0 !shadow-none focus:!border-0 focus:!outline-0 focus:!ring-0 focus:!shadow-none rounded-none p-0 m-0 resize-none text-foreground font-mono pl-20 pr-4 overflow-hidden scrollbar-hide"
              style={{ 
                lineHeight: '32px',
                letterSpacing: '0.5px',
                caretColor: 'hsl(var(--primary))',
                minHeight: '512px',
                border: 'none !important',
                outline: 'none !important',
                boxShadow: 'none !important',
              }}
            />
            
            {/* 内容占位提示 */}
            {!content && !contentFocused && (
              <div className="absolute top-2 left-24 text-base text-muted-foreground opacity-60 pointer-events-none font-mono">
                {t('writeNote')} - 支持 **粗体**、*斜体*、`代码`、[链接](url)、## 标题 等语法
              </div>
            )}
          </>
        )}

        {viewMode === 'preview' && (
          <div className="pl-20 pr-4 min-h-[512px]">
            <div className="markdown-content prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  // 自定义组件渲染
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
                {content || '# 预览\n\n在左侧编辑器中输入 Markdown 内容，这里将显示渲染结果。'}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="flex gap-4 min-h-[512px]">
            {/* 左侧编辑器 */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setContentFocused(true)}
                onBlur={() => setContentFocused(false)}
                placeholder=""
                className="w-full bg-transparent !border-0 !outline-0 !ring-0 !shadow-none focus:!border-0 focus:!outline-0 focus:!ring-0 focus:!shadow-none rounded-none p-0 m-0 resize-none text-foreground font-mono pl-20 pr-4 overflow-hidden scrollbar-hide"
                style={{ 
                  lineHeight: '32px',
                  letterSpacing: '0.5px',
                  caretColor: 'hsl(var(--primary))',
                  minHeight: '512px',
                  border: 'none !important',
                  outline: 'none !important',
                  boxShadow: 'none !important',
                }}
              />
              
              {!content && !contentFocused && (
                <div className="absolute top-2 left-24 text-base text-muted-foreground opacity-60 pointer-events-none font-mono">
                  编辑 Markdown...
                </div>
              )}
            </div>
            
            {/* 分割线 */}
            <div className="w-px bg-border"></div>
            
            {/* 右侧预览 */}
            <div className="flex-1 pr-4">
              <div className="markdown-content prose prose-slate dark:prose-invert max-w-none">
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
                  {content || '# 预览\n\n实时预览 Markdown 渲染结果。'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 纸张书写引导线 */}
      <div className="absolute inset-0 pointer-events-none">
        {!title && !titleFocused && (
          <div className="absolute top-8 left-[84px] w-1 h-1 bg-primary/40 rounded-full animate-pulse"></div>
        )}
        {!content && !contentFocused && title && viewMode === 'edit' && (
          <div className="absolute top-32 left-[84px] w-1 h-1 bg-primary/40 rounded-full animate-pulse"></div>
        )}
      </div>
    </>
  );
}