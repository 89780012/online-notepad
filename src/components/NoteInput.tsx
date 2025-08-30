'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NoteInputProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export default function NoteInput({ title, content, onTitleChange, onContentChange }: NoteInputProps) {
  const t = useTranslations();
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  return (
    <>
      {/* 标题输入区域 */}
      <div className="relative mb-8" style={{ height: '64px' }}>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          placeholder=""
          className="text-2xl font-bold absolute inset-0 w-full h-full bg-transparent border-0 outline-none focus:ring-0 focus:outline-none focus:border-0 rounded-none p-0 m-0"
          style={{ 
            lineHeight: '32px',
            paddingLeft: '84px',
            paddingTop: '16px',
            paddingBottom: '16px',
            paddingRight: '16px',
            color: '#374151',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            fontFamily: '"Courier New", monospace',
            caretColor: '#3b82f6',
            fontSize: "32px"
          }}
        />
        {/* 标题区域的聚焦反馈 */}
        {titleFocused && (
          <div className="absolute left-20 top-0 bottom-0 w-1 bg-blue-400 opacity-50 animate-pulse pointer-events-none"></div>
        )}
        {/* 标题占位提示 */}
        {!title && !titleFocused && (
          <div className="absolute top-4 left-24 text-lg text-gray-400 opacity-60 pointer-events-none font-mono">
            {t('noteTitle')}
          </div>
        )}
      </div>
      
      {/* 内容输入区域 */}
      <div className="relative" style={{ minHeight: '512px' }}>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          onFocus={() => setContentFocused(true)}
          onBlur={() => setContentFocused(false)}
          placeholder=""
          className="absolute inset-0 w-full h-full bg-transparent border-0 outline-none focus:ring-0 focus:outline-none focus:border-0 rounded-none p-0 m-0 resize-none"
          style={{ 
            lineHeight: '32px',
            paddingLeft: '84px',
            paddingTop: '0',
            paddingBottom: '0',
            paddingRight: '16px',
            color: '#374151',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            fontFamily: '"Courier New", monospace',
            caretColor: '#3b82f6',
            letterSpacing: '0.5px'
          }}
        />
        {/* 内容区域的聚焦反馈 */}
        {contentFocused && (
          <div className="absolute left-20 top-0 bottom-0 w-1 bg-blue-400 opacity-50 animate-pulse pointer-events-none"></div>
        )}
        {/* 内容占位提示 */}
        {!content && !contentFocused && (
          <div className="absolute top-2 left-24 text-base text-gray-400 opacity-60 pointer-events-none font-mono">
            {t('writeNote')}
          </div>
        )}
      </div>
      
      {/* 纸张书写引导线 */}
      <div className="absolute inset-0 pointer-events-none">
        {!title && !titleFocused && (
          <div className="absolute top-8 left-[84px] w-1 h-1 bg-blue-300 rounded-full opacity-40 animate-pulse"></div>
        )}
        {!content && !contentFocused && title && (
          <div className="absolute top-24 left-[84px] w-1 h-1 bg-blue-300 rounded-full opacity-40 animate-pulse"></div>
        )}
      </div>
    </>
  );
}