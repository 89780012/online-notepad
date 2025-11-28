import { locales as supportedLocales, defaultLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

export { defaultLocale };
export type { Locale };
export const locales = supportedLocales;

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/');
  const localeSegment = segments[1];
  
  if (locales.includes(localeSegment as Locale)) {
    return localeSegment as Locale;
  }
  
  return defaultLocale;
}

export function createLocalizedPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return path;
  }
  
  return `/${locale}${path}`;
}