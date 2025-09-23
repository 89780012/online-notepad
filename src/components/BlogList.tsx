'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import BlogCard from './BlogCard';
import type { BlogListResponse, BlogPostSummary } from '@/types/blog';

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchBlogs = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`/api/blog?page=${pageNum}&pageSize=10&status=published`);

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data: BlogListResponse = await response.json();

      if (pageNum === 1) {
        setBlogs(data.blogs);
      } else {
        setBlogs(prev => [...prev, ...data.blogs]);
      }

      setTotal(data.total);
      setHasMore(data.blogs.length === data.pageSize && blogs.length + data.blogs.length < data.total);
    } catch (err) {
      console.error('Fetch blogs error:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [blogs.length]);

  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBlogs(nextPage);
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Loading Articles</h3>
          <p className="text-muted-foreground">Fetching the latest insights for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchBlogs(1);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            <span>Try Again</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

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
      {/* 博客统计和筛选区域 */}
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
        
        {/* 可以在这里添加搜索和筛选功能 */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Latest first
          </div>
        </div>
      </div>

      {/* 博客列表 - 响应式网格 */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {blogs.map((blog, index) => (
          <div key={blog.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <BlogCard blog={blog} />
          </div>
        ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
          >
            {loading ? (
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
    </div>
  );
}