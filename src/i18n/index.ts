'use server';

import { cookies, headers } from 'next/headers';

import { defaultLocale, Locale } from '@/i18n/config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getLocale(): Promise<Locale> {
  // 优先从 next-intl middleware 设置的 header 获取
  const headersList = await headers();
  const localeFromUrl = headersList.get('x-next-intl-locale');

  if (localeFromUrl) {
    return localeFromUrl as Locale;
  }

  // 其次从 Cookie 获取
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get(COOKIE_NAME)?.value;

  return (localeFromCookie as Locale) || defaultLocale;
}

export async function setLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}