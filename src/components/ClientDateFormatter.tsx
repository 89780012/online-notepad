'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

interface ClientDateFormatterProps {
  dateString: string;
  className?: string;
}

export default function ClientDateFormatter({ dateString, className = '' }: ClientDateFormatterProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  useEffect(() => {
    setIsMounted(true);
    
    // 客户端格式化日期
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    setFormattedDate(formatted);
  }, [dateString, locale]);

  // 在服务端渲染期间显示简单的日期
  if (!isMounted) {
    return (
      <span className={className}>
        {t('lastUpdated')}: {new Date(dateString).toISOString().split('T')[0]}
      </span>
    );
  }

  return (
    <span className={className}>
      {t('lastUpdated')}: {formattedDate}
    </span>
  );
}
