'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading blog posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-destructive mr-2" />
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading blog posts</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchBlogs(1);
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">No blog posts yet</h3>
        <p className="text-muted-foreground">Check back later for new content!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 博客统计 */}
      <div className="text-sm text-muted-foreground">
        Showing {blogs.length} of {total} posts
      </div>

      {/* 博客列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="text-center pt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Posts'
            )}
          </button>
        </div>
      )}

      {/* 已加载完所有文章 */}
      {!hasMore && blogs.length > 0 && (
        <div className="text-center pt-8 text-muted-foreground">
          <p>You&apos;ve reached the end of our blog posts!</p>
        </div>
      )}
    </div>
  );
}