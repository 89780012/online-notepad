'use server';

import { cookies, headers } from 'next/headers';

import { defaultLocale, Locale } from '@/i18n/config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getLocale(): Promise<Locale> {
  // 1. Prefer locale from request header (set by next-intl based on URL like /zh)
  const headerStore = await headers();
  const headerLocale = headerStore.get('x-next-intl-locale') as Locale | null;
  if (headerLocale) {
    console.log('current get locale from header:', headerLocale, 'default locale:', defaultLocale);
    return headerLocale;
  }

  // 2. Fallback to cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIE_NAME)?.value as Locale | undefined;
  console.log('current get locale from cookie:', cookieLocale, 'default locale:', defaultLocale);

  // 3. Finally fallback to defaultLocale
  return cookieLocale || defaultLocale;
}

export async function setLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}