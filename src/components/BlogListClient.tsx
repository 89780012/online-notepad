'use client';

import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import BlogCard from './BlogCard';
import type { BlogPostSummary } from '@/types/blog';

interface BlogListClientProps {
  initialBlogs: BlogPostSummary[];
  initialTotal: number;
}

export default function BlogListClient({ initialBlogs, initialTotal }: BlogListClientProps) {
  const [blogs, setBlogs] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(2); // 从第2页开始，因为第1页已经在服务端渲染了
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog?page=${page}&pageSize=10&status=published`);

      if (!response.ok) {
        throw new Error('Failed to fetch more blogs');
      }

      const data = await response.json();
      
      setBlogs(prev => [...prev, ...data.blogs]);
      setHasMore(data.blogs.length === data.pageSize && (initialBlogs.length + blogs.length + data.blogs.length) < initialTotal);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('Load more error:', err);
      setError('Failed to load more articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 如果没有额外的博客要显示，就不渲染任何内容
  if (blogs.length === 0 && !hasMore) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* 客户端加载的额外博客 */}
      {blogs.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog, index) => (
            <div key={blog.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      )}

      {/* 错误状态 */}
      {error && (
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
    </div>
  );
}
