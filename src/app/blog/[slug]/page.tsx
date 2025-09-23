import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag, Home } from 'lucide-react';
import BlogContent from '@/components/BlogContent';
import type { BlogDetailResponse } from '@/types/blog';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
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
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 group"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium hidden sm:inline">Home</span>
              </Link>
              <div className="h-4 w-px bg-border"></div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Blog</span>
              </Link>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
              {publishedDate && (
                <>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span>{publishedDate}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 英雄区域 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02]">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.01]"></div>
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto">
            {/* 文章分类标签 */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full text-sm font-semibold border border-primary/20 shadow-sm">
                <Tag className="h-4 w-4" />
                Article
              </div>
              
              {blog.keywords && (
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    {blog.keywords.split(',').map((keyword, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                      >
                        #{keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-full text-xs border border-green-200 dark:border-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></span>
                <span className="font-medium text-green-700 dark:text-green-400">Published</span>
              </div>
            </div>

            {/* 文章标题 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
              {blog.title}
            </h1>

            {/* 文章描述 */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl">
              {blog.description}
            </p>

            {/* 元信息卡片 */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {publishedDate && (
                <div className="flex items-center gap-3 px-4 py-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Published</div>
                    <div className="text-sm font-semibold text-foreground">{publishedDate}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 px-4 py-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Reading time</div>
                  <div className="text-sm font-semibold text-foreground">{readingTime} minutes</div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-lg">📚</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Sections</div>
                  <div className="text-sm font-semibold text-foreground">{blog.content.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <BlogContent content={blog.content} />
          </article>

          {/* 文章结束装饰 */}
          <div className="flex items-center justify-center my-16">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="w-8 h-px bg-gradient-to-r from-primary via-secondary to-primary"></div>
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
            </div>
          </div>

          {/* 页脚导航 */}
          <footer className="mt-16 pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 text-foreground font-medium rounded-xl transition-all duration-300 hover:shadow-lg border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 group"
                >
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Back to Home</span>
                </Link>
                
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-foreground font-medium rounded-xl transition-all duration-300 hover:shadow-lg border border-transparent hover:border-primary/20 group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span>All articles</span>
                </Link>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Thank you for reading! 🙏
              </div>
            </div>
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