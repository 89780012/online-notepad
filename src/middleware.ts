import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh', 'hi'],
  defaultLocale: 'en',
  localePrefix: "as-needed", // 默认语言不显示前缀，其他语言显示前缀
  // 禁用浏览器语言检测，强制使用默认语言
  localeDetection: false
});

export const config = {
  // 修复as-needed模式的匹配规则，确保正确处理所有路由
  // 排除 /blog 路径，因为博客功能不需要国际化
  matcher: [
    // 匹配根路径
    '/',
    // 匹配所有路径，但排除博客路径和其他静态资源
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|og-image.png|blog).*)'
  ]
};