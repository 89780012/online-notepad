import { Metadata } from 'next';

// SEO 基础配置
export const SEO_CONFIG = {
  defaultTitle: 'Mini Notepad - Online Markdown Editor & Note Taking App',
  defaultDescription: 'Free online notepad with Markdown support. Create, edit, and share notes instantly. Perfect for writing, documentation, and quick notes.',
  defaultKeywords: ['online notepad', 'markdown editor', 'note taking', 'digital notes', 'writing tool', 'productivity'],
  siteName: 'Mini Notepad',
  siteUrl: process.env.NEXTAUTH_URL || 'https://www.mininotepad.com',
  author: 'Mini Notepad Team',
  twitterHandle: '@miininotepad',
} as const;

// 标准化的 SEO 元数据配置
export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string | null;
  modifiedTime?: string;
  authors?: string[];
  locale?: string;
  alternateLanguages?: Record<string, string>;
  noIndex?: boolean;
  articleTags?: string[];
  articleSection?: string;
}

// 生成标准化的 Metadata 对象
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description = SEO_CONFIG.defaultDescription,
    keywords = SEO_CONFIG.defaultKeywords,
    canonical,
    ogType = 'website',
    ogImage,
    publishedTime,
    modifiedTime,
    authors = [SEO_CONFIG.author],
    locale = 'en_US',
    alternateLanguages,
    noIndex = false,
    articleTags,
    articleSection,
  } = config;

  // 处理标题
  const finalTitle = title
    ? `${title}`
    : SEO_CONFIG.defaultTitle;

  // 处理关键词
  const keywordArray = Array.isArray(keywords)
    ? keywords
    : typeof keywords === 'string'
    ? keywords.split(',').map((k: string) => k.trim())
    : SEO_CONFIG.defaultKeywords;
  const keywordString = keywordArray.join(', ');

  // 基础 metadata
  const metadata: Metadata = {
    title: finalTitle,
    description,
    keywords: keywordString,
    authors: authors.map(author => ({ name: author })),

    // Open Graph
    openGraph: {
      title: title || SEO_CONFIG.defaultTitle,
      description,
      url: canonical || SEO_CONFIG.siteUrl,
      siteName: SEO_CONFIG.siteName,
      locale,
      type: ogType,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && ogType === 'article' && { authors }),
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: title || SEO_CONFIG.defaultTitle,
      description,
      creator: SEO_CONFIG.twitterHandle,
      ...(ogImage && { images: [ogImage] }),
    },

    // Canonical URL 和替代语言
    alternates: {
      ...(canonical && { canonical }),
      ...(alternateLanguages && { languages: alternateLanguages }),
    },

    // 机器人指令
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  // 添加文章特定的 meta 标签
  if (ogType === 'article') {
    metadata.other = {
      ...(authors.length > 0 && { 'article:author': authors[0] }),
      ...(publishedTime && { 'article:published_time': publishedTime }),
      ...(modifiedTime && { 'article:modified_time': modifiedTime }),
      ...(articleSection && { 'article:section': articleSection }),
      ...(articleTags && { 'article:tag': articleTags.join(',') }),
    };
  }

  return metadata;
}

// 博客文章 SEO 配置生成器
export function generateBlogSEO(config: {
  title: string;
  description: string | undefined;
  slug: string;
  keywords?: string[];
  publishedAt?: string | null;
  updatedAt?: string;
  locale?: string;
}): Metadata {
  const { title, description, slug, keywords = [], publishedAt, updatedAt, locale = 'en' } = config;

  return generateSEOMetadata({
    title,
    description,
    keywords,
    canonical: `${SEO_CONFIG.siteUrl}/blog/${slug}`,
    ogType: 'article',
    publishedTime: publishedAt,
    modifiedTime: updatedAt,
    articleSection: 'Digital Note-Taking',
    articleTags: keywords,
    locale: locale === 'zh' ? 'zh_CN' : 'en_US',
  });
}

// 多语言文章 SEO 配置生成器
export function generateArticleSEO(config: {
  title: string;
  description: string;
  slug: string;
  locale: string;
  keywords?: string[];
  publishedAt?: string;
  updatedAt?: string;
  alternateLanguages?: Record<string, string>;
}): Metadata {
  const { title, description, slug, locale, keywords = [], publishedAt, updatedAt, alternateLanguages } = config;

  return generateSEOMetadata({
    title,
    description,
    keywords,
    canonical: `${SEO_CONFIG.siteUrl}/${locale}/articles/${slug}`,
    ogType: 'article',
    publishedTime: publishedAt,
    modifiedTime: updatedAt,
    articleSection: 'Tutorial',
    articleTags: keywords,
    locale: locale === 'zh' ? 'zh_CN' : locale === 'hi' ? 'hi_IN' : 'en_US',
    alternateLanguages,
  });
}

// 页面级别 SEO 配置生成器
export function generatePageSEO(config: {
  title: string;
  description: string;
  path: string;
  locale?: string;
  keywords?: string[];
  alternateLanguages?: Record<string, string>;
}): Metadata {
  const { title, description, path, locale = 'en', keywords, alternateLanguages } = config;

  return generateSEOMetadata({
    title,
    description,
    keywords,
    canonical: `${SEO_CONFIG.siteUrl}${path}`,
    ogType: 'website',
    locale: locale === 'zh' ? 'zh_CN' : locale === 'hi' ? 'hi_IN' : 'en_US',
    alternateLanguages,
  });
}

// 结构化数据生成器 (JSON-LD)
export function generateJSONLD(
  type: 'BlogPosting' | 'Article' | 'WebSite' | 'Organization',
  data: Record<string, string | number | boolean | object | null>
): string {
  const baseData: Record<string, string | number | boolean | object | null> = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  // 添加网站特定信息
  if (type === 'WebSite') {
    baseData.url = SEO_CONFIG.siteUrl;
    baseData.name = SEO_CONFIG.siteName;
    baseData.description = SEO_CONFIG.defaultDescription;
    baseData.potentialAction = {
      '@type': 'SearchAction',
      target: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    };
  }

  // 添加组织信息
  if (type === 'Organization') {
    baseData.name = SEO_CONFIG.siteName;
    baseData.url = SEO_CONFIG.siteUrl;
    baseData.description = SEO_CONFIG.defaultDescription;
  }

  // 为文章类型添加发布者信息
  if (type === 'BlogPosting' || type === 'Article') {
    baseData.publisher = {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    };
    baseData.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': (data.url as string) || SEO_CONFIG.siteUrl,
    };
  }

  return JSON.stringify(baseData, null, 0);
}

// 预设的 JSON-LD 生成器
export function generateBlogPostJSONLD(config: {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  keywords?: string[];
  author?: string;
}): string {
  const { title, description, url, publishedAt, updatedAt, keywords, author = SEO_CONFIG.author } = config;

  return generateJSONLD('BlogPosting', {
    headline: title,
    description: description || '',
    url,
    datePublished: publishedAt || null,
    dateModified: updatedAt || null,
    keywords: keywords?.join(',') || '',
    author: {
      '@type': 'Person',
      name: author,
    },
  });
}

// 网站首页 JSON-LD
export function generateWebsiteJSONLD(): string {
  return generateJSONLD('WebSite', {
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
  });
}