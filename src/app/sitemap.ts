import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { locales, defaultLocale } from '@/i18n/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.mininotepad.com';
  
  // 获取所有已发布的博客文章
  let blogPosts: Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }> = [];
  
  try {
    blogPosts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error);
  }

  const staticPages: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 为所有语言生成多语言页面
  for (const locale of locales) {
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`;

    // 主页
    staticPages.push({
      url: `${baseUrl}${localePrefix}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: locale === defaultLocale ? 1.0 : 0.9,
    });

    // 模板页面
    staticPages.push({
      url: `${baseUrl}${localePrefix}/templates`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });

    // 隐私政策页面
    staticPages.push({
      url: `${baseUrl}${localePrefix}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    });

    // 服务条款页面
    staticPages.push({
      url: `${baseUrl}${localePrefix}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    });

    // 更新日志页面
    staticPages.push({
      url: `${baseUrl}${localePrefix}/changelog`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // 博客首页（不需要多语言）
  staticPages.push({
    url: `${baseUrl}/blog`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  });

  // 动态博客文章页面（不需要多语言）
  const blogPages = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...blogPages,
  ];
}
