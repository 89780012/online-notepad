'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NoteInputProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  showPaperLines?: boolean;
}

export default function NoteInput({ title, content, onTitleChange, onContentChange, showPaperLines = true }: NoteInputProps) {
  const t = useTranslations();
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整textarea高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 重置高度以获得准确的 scrollHeight
      textarea.style.height = 'auto';
      // 设置新高度，至少为 512px（32行 × 16px line-height）
      const newHeight = Math.max(512, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // 监听内容变化，自动调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  // 处理初始渲染时的高度调整
  useEffect(() => {
    const timer = setTimeout(() => {
      adjustTextareaHeight();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
    // 立即调整高度，确保响应性
    requestAnimationFrame(() => {
      adjustTextareaHeight();
    });
  };

  // 处理键盘事件，支持tab键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      
      // 插入tab字符（使用2个空格代替tab）
      const tabChar = '  ';
      const newValue = target.value.substring(0, start) + tabChar + target.value.substring(end);
      
      // 更新对应的状态
      if (target === textareaRef.current) {
        onContentChange(newValue);
      } else {
        onTitleChange(newValue);
      }
      
      // 设置光标位置到tab后面
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + tabChar.length;
      }, 0);
    }
  };

  return (
    <div className="h-full flex flex-col">
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
      
      {/* 内容输入区域 */}
      <div className="relative flex-1 min-h-0">
        <Textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setContentFocused(true)}
          onBlur={() => setContentFocused(false)}
          placeholder=""
          className="w-full h-full bg-transparent !border-0 !outline-0 !ring-0 !shadow-none focus:!border-0 focus:!outline-0 focus:!ring-0 focus:!shadow-none rounded-none p-0 m-0 resize-none text-foreground font-mono pl-20 pr-4 overflow-auto scrollbar-hide"
          style={{ 
            lineHeight: '32px',
            letterSpacing: '0.5px',
            caretColor: 'hsl(var(--primary))',
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important',
          }}
        />
        
        
        {/* 内容占位提示 */}
        {!content && !contentFocused && (
          <div className="absolute top-2 left-24 text-base text-muted-foreground opacity-60 pointer-events-none font-mono">
            {t('writeNote')}
          </div>
        )}
      </div>
      
      {/* 纸张书写引导线 */}
      {showPaperLines && (
        <div className="absolute inset-0 pointer-events-none">
          {!title && !titleFocused && (
            <div className="absolute top-8 left-[84px] w-1 h-1 bg-primary/40 rounded-full animate-pulse"></div>
          )}
          {!content && !contentFocused && title && (
            <div className="absolute top-24 left-[84px] w-1 h-1 bg-primary/40 rounded-full animate-pulse"></div>
          )}
        </div>
      )}
    </div>
  );
}