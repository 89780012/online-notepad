export const locales = ['en', 'zh'] as const;

export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

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