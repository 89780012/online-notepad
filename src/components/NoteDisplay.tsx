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
      <div className="relative mb-8 h-16">
        <div className="text-2xl font-bold absolute inset-0 w-full h-full bg-transparent flex items-center text-foreground font-mono pl-20 pr-4"
          style={{ 
            fontSize: "32px"
          }}
        >
          {title || (showPlaceholder ? t('noteTitle') : '')}
        </div>
        {!title && showPlaceholder && (
          <div className="absolute top-4 left-24 text-lg text-muted-foreground opacity-60 pointer-events-none font-mono">
            {t('noteTitle')}
          </div>
        )}
      </div>
      
      {/* 内容显示区域 */}
      <div className="relative min-h-[512px]">
        <div className="absolute inset-0 w-full h-full bg-transparent whitespace-pre-wrap text-foreground font-mono pl-20 pr-4"
          style={{ 
            lineHeight: '32px',
            letterSpacing: '0.5px'
          }}
        >
          {content || (showPlaceholder ? t('writeNote') : '')}
        </div>
        {!content && showPlaceholder && (
          <div className="absolute top-2 left-24 text-base text-muted-foreground opacity-60 pointer-events-none font-mono">
            {t('writeNote')}
          </div>
        )}
      </div>
    </>
  );
}