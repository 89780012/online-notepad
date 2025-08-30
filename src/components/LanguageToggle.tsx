'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <Button variant="outline" onClick={toggleLanguage} size="sm">
      {locale === 'en' ? t('chinese') : t('english')}
    </Button>
  );
}