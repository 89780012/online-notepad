import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import BlogContent from '@/components/BlogContent';
import type { BlogDetailResponse } from '@/types/blog';

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

// 获取博客数据
async function getBlogPost(slug: string): Promise<BlogDetailResponse | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blog/${slug}`, {
      cache: 'no-store' // 确保数据是最新的
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
}

// 生成动态元数据
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blogData = await getBlogPost(slug);

  if (!blogData) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  const { blog } = blogData;

  return {
    title: `${blog.title} - Online Notepad Blog`,
    description: blog.description,
    keywords: blog.keywords,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: 'article',
      publishedTime: blog.publishedAt || undefined,
      modifiedTime: blog.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.description,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blogData = await getBlogPost(slug);

  if (!blogData) {
    notFound();
  }

  const { blog } = blogData;

  // 格式化日期
  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  // 估算阅读时间（按每分钟200字计算）
  const totalWords = blog.content.reduce((acc, section) =>
    acc + section.content.split(' ').length, 0
  );
  const readingTime = Math.ceil(totalWords / 200);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <Link
            href="/blog"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          {/* 文章头部 */}
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
              {blog.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              {blog.description}
            </p>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {publishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{publishedDate}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>

              {blog.keywords && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>{blog.keywords}</span>
                </div>
              )}
            </div>
          </header>

          {/* 文章内容 */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <BlogContent content={blog.content} />
          </article>

          {/* 页脚导航 */}
          <footer className="mt-16 pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all posts
            </Link>
          </footer>
        </div>
      </div>

      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: blog.title,
            description: blog.description,
            keywords: blog.keywords,
            datePublished: blog.publishedAt,
            dateModified: blog.updatedAt,
            author: {
              '@type': 'Organization',
              name: 'Online Notepad Team'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Online Notepad'
            }
          })
        }}
      />
    </div>
  );
}