import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BlogCard from './BlogCard';
import BlogListClient from './BlogListClient';
import type { BlogPostSummary } from '@/types/blog';
import { prisma } from '@/lib/prisma';

interface DatabaseBlogPost {
  id: string;
  title: string;
  description: string;
  slug: string;
  publishedAt: Date | null;
  createdAt: Date;
}

// 服务端获取博客数据
async function getBlogPosts(page: number = 1, pageSize: number = 30) {
  try {
    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.blogPost.count({
        where: { status: 'published' },
      }),
    ]);

    await prisma.$disconnect();

    return {
      blogs: blogs.map((blog: DatabaseBlogPost): BlogPostSummary => ({
        ...blog,
        publishedAt: blog.publishedAt?.toISOString() || null,
        createdAt: blog.createdAt.toISOString(),
        excerpt: blog.description, // 使用description作为excerpt
      })),
      total,
      hasMore: total > page * pageSize,
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return {
      blogs: [],
      total: 0,
      hasMore: false,
      currentPage: 1,
      pageSize: 30,
    };
  }
}

// 服务端组件
export default async function BlogListServer() {
  const { blogs, total, hasMore } = await getBlogPosts(1, 30);

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-foreground mb-3">No Articles Yet</h3>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;re working on creating amazing content about digital note-taking and productivity. 
            Check back soon for fresh insights!
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            Coming soon
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 博客统计区域 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <span className="font-medium text-foreground">{blogs.length}</span> of {total} articles
          </div>
          <div className="h-4 w-px bg-border"></div>
          <div className="text-sm text-muted-foreground">
            Fresh insights weekly
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Latest first
          </div>
        </div>
      </div>

      {/* 服务端渲染的博客列表 - SEO友好 */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {blogs.map((blog: BlogPostSummary, index: number) => (
          <div key={blog.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <BlogCard blog={blog} />
          </div>
        ))}
      </div>

      {/* 客户端组件处理"加载更多"功能 */}
      {hasMore && (
        <Suspense fallback={
          <div className="flex justify-center pt-8">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-muted/50 rounded-xl">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more articles...</span>
            </div>
          </div>
        }>
          <BlogListClient initialBlogs={blogs} initialTotal={total} />
        </Suspense>
      )}

      {/* 已加载完所有文章 */}
      {!hasMore && blogs.length > 0 && (
        <div className="text-center pt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted/50 rounded-full text-muted-foreground">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>You&apos;ve explored all our articles!</span>
          </div>
        </div>
      )}

      {/* 结构化数据 - 帮助SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Online Notepad Blog",
            "description": "Digital note-taking insights and productivity tips",
            "url": "https://your-domain.com/blog",
            "blogPost": blogs.map((blog: BlogPostSummary) => ({
              "@type": "BlogPosting",
              "headline": blog.title,
              "description": blog.excerpt || blog.description,
              "url": `https://your-domain.com/blog/${blog.slug}`,
              "datePublished": blog.publishedAt,
              "author": {
                "@type": "Person",
                "name": "Online Notepad Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Online Notepad",
                "url": "https://your-domain.com"
              }
            }))
          })
        }}
      />
    </div>
  );
}
