import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag, Home } from 'lucide-react';
import BlogContent from '@/components/BlogContent';
import { BlogPostJSONLD } from '@/components/SEOComponents';
import FloatingHomeButton from '@/components/FloatingHomeButton';
import RelatedArticles from '@/components/RelatedArticles';
import { generateBlogSEO } from '@/lib/seo';
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

  return generateBlogSEO({
    title: blog.title,
    description: blog.description,
    slug,
    keywords: blog.keywords?.split(',').map(k => k.trim()) || [],
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt,
  });
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

      {/* 精简的英雄区域 */}
      <div className="relative bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02] border-b border-border/50">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            {/* 文章分类标签 */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full text-sm font-semibold border border-primary/20">
                <Tag className="h-3 w-3" />
                Article
              </div>
              
              {blog.keywords && (
                <div className="flex flex-wrap gap-2">
                  {blog.keywords.split(',').slice(0, 3).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted/50 text-muted-foreground rounded-md text-xs font-medium border border-border/30"
                    >
                      #{keyword.trim()}
                    </span>
                  ))}
                  {blog.keywords.split(',').length > 3 && (
                    <span className="px-3 py-1 text-muted-foreground text-xs">
                      +{blog.keywords.split(',').length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950/20 rounded-full text-xs border border-green-200 dark:border-green-800">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-green-700 dark:text-green-400">Published</span>
              </div>
            </div>

            {/* 文章标题 */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* 文章描述 */}
            <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed max-w-4xl">
              {blog.description}
            </p>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

              <div className="flex items-center gap-2">
                <span className="text-base">📚</span>
                <span>{blog.content.length} sections</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 文章内容区域 */}
            <div className="lg:col-span-3">
              <article className="prose prose-lg dark:prose-invert max-w-none">
                <BlogContent content={blog.content} />
              </article>

              {/* 文章结束装饰 */}
              <div className="flex items-center justify-center my-12">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-8 h-px bg-gradient-to-r from-primary via-secondary to-primary"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                </div>
              </div>

              {/* 页脚导航 */}
              <footer className="mt-12 pt-6 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 text-foreground font-medium rounded-lg transition-all duration-300 border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 group text-sm"
                    >
                      <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Back to Home</span>
                    </Link>
                    
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-foreground font-medium rounded-lg transition-all duration-300 border border-transparent hover:border-primary/20 group text-sm"
                    >
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      <span>All articles</span>
                    </Link>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Thank you for reading! 🙏
                  </div>
                </div>
              </footer>
            </div>

            {/* 相关文章侧边栏 */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <RelatedArticles currentSlug={slug} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* 结构化数据 */}
      <BlogPostJSONLD
        title={blog.title}
        description={blog.description}
        url={`${process.env.NEXTAUTH_URL || 'https://www.mininotepad.com'}/blog/${slug}`}
        publishedAt={blog.publishedAt}
        updatedAt={blog.updatedAt}
        keywords={blog.keywords?.split(',').map(k => k.trim())}
        author="Online Notepad Team"
      />

      {/* 浮动返回主页按钮 */}
      <FloatingHomeButton />
    </div>
  );
}