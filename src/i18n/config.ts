export type Locale = (typeof locales)[number];

export const locales = [
  'en',
  'zh',
  'hi',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'ja',
  'ko',
  'ru',
  'ar'
] as const;
export const defaultLocale: Locale = 'en';