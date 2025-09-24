'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import BlogCard from './BlogCard';
import type { BlogPostSummary, BlogListResponse } from '@/types/blog';

interface BlogListProps {
  className?: string;
}

export default function BlogList({ className = '' }: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 30; // 默认每页30条

  // 获取博客数据
  const fetchBlogs = async (pageNum: number = 1, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await fetch(`/api/blog?page=${pageNum}&pageSize=${pageSize}&status=published`);

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data: BlogListResponse = await response.json();
      
      if (isLoadMore) {
        // 加载更多时，追加到现有数据
        setBlogs(prev => [...prev, ...data.blogs]);
      } else {
        // 初次加载或刷新时，替换所有数据
        setBlogs(data.blogs);
      }
      
      setTotal(data.total);
      setPage(pageNum);
      
      // 检查是否还有更多数据
      const totalLoaded = isLoadMore ? blogs.length + data.blogs.length : data.blogs.length;
      setHasMore(totalLoaded < data.total);
      
    } catch (err) {
      console.error('Fetch blogs error:', err);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // 初次加载
  useEffect(() => {
    const loadInitialBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/blog?page=1&pageSize=${pageSize}&status=published`);

        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data: BlogListResponse = await response.json();
        
        setBlogs(data.blogs);
        setTotal(data.total);
        setPage(1);
        setHasMore(data.blogs.length < data.total);
        
      } catch (err) {
        console.error('Fetch blogs error:', err);
        setError('Failed to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialBlogs();
  }, [pageSize]);

  // 加载更多
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await fetchBlogs(page + 1, true);
  };

  // 刷新数据
  const refresh = async () => {
    setRefreshing(true);
    await fetchBlogs(1, false);
  };

  // 初次加载状态
  if (loading && blogs.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-foreground mb-3">Loading Articles</h3>
          <p className="text-muted-foreground leading-relaxed">
            Fetching the latest content for you...
          </p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && blogs.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/20 flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/30 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-foreground mb-3">Failed to Load</h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {error}
          </p>
          <button
            onClick={() => fetchBlogs(1, false)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 无文章状态
  if (blogs.length === 0 && !loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
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
    <div className={`space-y-12 ${className}`}>
      {/* 博客统计和刷新区域 */}
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
        
        <div className="flex items-center gap-4">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-muted/50 hover:bg-muted/70 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="text-xs text-muted-foreground">
            Latest first
          </div>
        </div>
      </div>

      {/* 博客列表网格 */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {blogs.map((blog: BlogPostSummary, index: number) => (
          <div key={blog.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <BlogCard blog={blog} />
          </div>
        ))}
      </div>

      {/* 错误状态 - 加载更多时 */}
      {error && blogs.length > 0 && (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300"
          >
            <span>Try Again</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 加载更多按钮 */}
      {hasMore && !error && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more articles...</span>
              </>
            ) : (
              <>
                <span className="font-medium">Load More Articles</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="text-xs">+</span>
                </div>
              </>
            )}
          </button>
        </div>
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
              "description": blog.description,
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