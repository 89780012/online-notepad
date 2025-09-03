import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: "as-needed", // 默认语言不显示前缀，其他语言显示前缀
  // 禁用浏览器语言检测，强制使用默认语言
  localeDetection: false
});

export const config = {
  // 修复as-needed模式的匹配规则，确保正确处理分享路由
  matcher: [
    // 匹配根路径
    '/',
    // 匹配所有路径，包括无前缀的share路径和有前缀的语言路径
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};