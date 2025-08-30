'use client';

import { useTranslations } from 'next-intl';

interface NoteDisplayProps {
  title: string;
  content: string;
  showPlaceholder?: boolean;
}

export default function NoteDisplay({ title, content, showPlaceholder = true }: NoteDisplayProps) {
  const t = useTranslations();

  return (
    <>
      {/* 标题显示区域 */}
      <div className="relative mb-8" style={{ height: '64px' }}>
        <div 
          className="text-2xl font-bold absolute inset-0 w-full h-full bg-transparent flex items-center"
          style={{ 
            paddingLeft: '84px',
            paddingRight: '16px',
            color: '#374151',
            fontFamily: '"Courier New", monospace',
            fontSize: "32px"
          }}
        >
          {title || (showPlaceholder ? t('noteTitle') : '')}
        </div>
        {!title && showPlaceholder && (
          <div className="absolute top-4 left-24 text-lg text-gray-400 opacity-60 pointer-events-none font-mono">
            {t('noteTitle')}
          </div>
        )}
      </div>
      
      {/* 内容显示区域 */}
      <div className="relative" style={{ minHeight: '512px' }}>
        <div 
          className="absolute inset-0 w-full h-full bg-transparent whitespace-pre-wrap"
          style={{ 
            lineHeight: '32px',
            paddingLeft: '84px',
            paddingTop: '0',
            paddingBottom: '0',
            paddingRight: '16px',
            color: '#374151',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '0.5px'
          }}
        >
          {content || (showPlaceholder ? t('writeNote') : '')}
        </div>
        {!content && showPlaceholder && (
          <div className="absolute top-2 left-24 text-base text-gray-400 opacity-60 pointer-events-none font-mono">
            {t('writeNote')}
          </div>
        )}
      </div>
    </>
  );
}