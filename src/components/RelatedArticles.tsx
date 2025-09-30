'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import type { BlogPostSummary } from '@/types/blog';

interface RelatedArticlesProps {
  currentSlug: string;
  className?: string;
}

interface RelatedArticlesResponse {
  related: BlogPostSummary[];
  total: number;
}

export default function RelatedArticles({ currentSlug, className = '' }: RelatedArticlesProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/${currentSlug}/related?limit=6`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch related articles');
        }

        const data: RelatedArticlesResponse = await response.json();
        setRelatedPosts(data.related);
      } catch (err) {
        console.error('Error fetching related posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load related articles');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentSlug]);

  // 估算阅读时间
  const estimateReadingTime = (description: string) => {
    const words = description.split(' ').length;
    return Math.max(1, Math.ceil(words / 200)); // 每分钟200字
  };

  if (loading) {
    return (
      <div className={`bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Related Articles</h3>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted/70 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || relatedPosts.length === 0) {
    return null; // 静默处理错误，不显示组件
  }

  return (
    <div className={`bg-card/30 backdrop-blur-sm rounded-xl border border-border/30 p-5 shadow-sm ${className}`}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/30">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Related Articles</h2>
      </div>

      {/* 文章列表 */}
      <div className="space-y-4">
        {relatedPosts.map((post, index) => (
            <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block p-3 rounded-lg hover:bg-muted/20 transition-all duration-200 border border-transparent hover:border-border/30 relative"
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            {/* 悬停效果背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-secondary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
            
            <div className="relative z-10">
              {/* 文章标题 */}
              <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                {post.title}
              </h4>
                
              {/* 文章描述 - 简化版 */}
              {post.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                  {post.description.length > 80 ? `${post.description.substring(0, 80)}...` : post.description}
                </p>
              )}

              {/* 元信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{estimateReadingTime(post.description || '')} min</span>
                  </div>
                  
                  {post.publishedAt && (
                    <>
                      <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </>
                  )}
                </div>

                {/* 箭头图标 */}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted/30 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200">
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>

              {/* 标签 - 简化版 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-1.5 py-0.5 bg-primary/8 text-primary text-xs rounded font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground/70">
                      +{post.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 查看更多链接 */}
      <div className="mt-5 pt-4 border-t border-border/30">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group w-full justify-center py-2 rounded-lg hover:bg-primary/5"
        >
          <span>View all articles</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* SEO结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Related Articles",
            "numberOfItems": relatedPosts.length,
            "itemListElement": relatedPosts.map((post, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Article",
                "name": post.title,
                "description": post.description,
                "url": `/blog/${post.slug}`,
                "datePublished": post.publishedAt,
                "keywords": post.tags?.join(", ")
              }
            }))
          })
        }}
      />
    </div>
  );
}
