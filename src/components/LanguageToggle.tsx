'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Check } from 'lucide-react';
import { locales as supportedLocales, defaultLocale, type Locale } from '@/i18n/config';

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  hi: 'हिंदी',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  ar: 'العربية'
};

type LanguageOption = {
  code: Locale;
  name: string;
};

const LANGUAGES: LanguageOption[] = supportedLocales.map((code) => ({
  code,
  name: LANGUAGE_LABELS[code] ?? code.toUpperCase()
}));

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const removeLocaleFromPath = (path: string, currentLocale: string) => {
    const segments = path.split('/');
    if (segments[1] === currentLocale) {
      segments.splice(1, 1);
    }
    const normalized = segments.join('/') || '/';
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  };

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    const pathWithoutLocale = removeLocaleFromPath(pathname, locale);
    if (newLocale === defaultLocale) {
      router.push(pathWithoutLocale === '' ? '/' : pathWithoutLocale);
      return;
    }

    const suffix = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
    router.push(`/${newLocale}${suffix}`);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{language.name}</span>
            {locale === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}