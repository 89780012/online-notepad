import React from 'react';

interface JSONLDProps {
  data: Record<string, string | number | boolean | object | null>;
}

/**
 * JSON-LD 结构化数据组件
 * 用于在页面中添加结构化数据以改善 SEO
 */
export function JSONLD({ data }: JSONLDProps) {
  return (
    <script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}

// 博客文章结构化数据组件
interface BlogPostJSONLDProps {
  title: string;
  description: string | undefined;
  url: string;
  publishedAt?: string | null;
  updatedAt?: string;
  keywords?: string[];
  author?: string;
  imageUrl?: string;
}

export function BlogPostJSONLD({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  keywords,
  author = 'Mini Notepad Team',
  imageUrl,
}: BlogPostJSONLDProps) {
  const jsonLdData: Record<string, string | number | boolean | object | null> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description || '',
    url,
    ...(publishedAt && { datePublished: publishedAt }),
    ...(updatedAt && { dateModified: updatedAt }),
    ...(keywords && { keywords: keywords.join(',') }),
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mini Notepad',
      url: process.env.NEXTAUTH_URL || 'https://notepad.best',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
        width: 1200,
        height: 630,
      },
    }),
  };

  return <JSONLD data={jsonLdData} />;
}

// 文章结构化数据组件
interface ArticleJSONLDProps {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  keywords?: string[];
  author?: string;
  section?: string;
  locale?: string;
}

export function ArticleJSONLD({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  keywords,
  author = 'Mini Notepad Team',
  section = 'Tutorial',
  locale = 'en',
}: ArticleJSONLDProps) {
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    ...(publishedAt && { datePublished: publishedAt }),
    ...(updatedAt && { dateModified: updatedAt }),
    ...(keywords && { keywords: keywords.join(',') }),
    articleSection: section,
    inLanguage: locale === 'zh' ? 'zh-CN' : locale === 'hi' ? 'hi-IN' : 'en-US',
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mini Notepad',
      url: process.env.NEXTAUTH_URL || 'https://notepad.best',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return <JSONLD data={jsonLdData} />;
}

// 网站首页结构化数据组件
export function WebsiteJSONLD() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://notepad.best';

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mini Notepad',
    description: 'Free online notepad with Markdown support. Create, edit, and share notes instantly.',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mini Notepad',
      url: baseUrl,
    },
  };

  return <JSONLD data={jsonLdData} />;
}

// 面包屑导航结构化数据组件
interface BreadcrumbJSONLDProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbJSONLD({ items }: BreadcrumbJSONLDProps) {
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JSONLD data={jsonLdData} />;
}

// 组织信息结构化数据组件
export function OrganizationJSONLD() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.mininotepad.com';

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mini Notepad',
    url: baseUrl,
    description: 'A modern online notepad application for creating, editing, and sharing digital notes.',
    foundingDate: '2025',
    // sameAs: [
    //   'https://github.com/miininotepad',
    //   'https://twitter.com/miininotepad',
    // ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@email.mininotepad.com',
    },
  };

  return <JSONLD data={jsonLdData} />;
}