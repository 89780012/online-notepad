import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: "as-needed",
  // 禁用浏览器语言检测，强制使用默认语言
  localeDetection: false
});

export const config = {
  matcher: ['/', '/(zh|en)/:path*']
};