'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import type { BlogPostSummary } from '@/types/blog';

interface BlogCardProps {
  blog: BlogPostSummary;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  
  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  // 处理文章点击导航
  const handleArticleClick = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    
    // 防止重复点击
    if (isNavigating) return;
    
    // 触发触觉反馈（如果设备支持）
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // 触发视觉效果
    setShowSparkles(true);
    setIsNavigating(true);
    
    // 添加点击音效（静默失败，因为需要用户首次交互）
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBSuBzvLZiTYIG2m98OScTwwOUarm7bVlGgU+ltryxnkpBSl+zPLaizsIGGS57+OZURE');
      audio.volume = 0.1;
      audio.play().catch(() => {}); // 静默处理音频播放失败
    } catch {
      // 忽略音频错误
    }
    
    // 添加一个短暂的延迟来显示动画效果
    setTimeout(() => {
      router.push(`/blog/${slug}`);
    }, 800);
    
    // 清理sparkles效果
    setTimeout(() => {
      setShowSparkles(false);
    }, 1200);
  };

  return (
    <article className={`group relative bg-card rounded-2xl border border-border/50 p-0 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:border-primary/20 hover:-translate-y-1 overflow-hidden ${
      isNavigating ? 'scale-105 shadow-2xl shadow-primary/20 border-primary/40' : ''
    }`}>
      {/* 装饰性渐变背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isNavigating ? '!opacity-100 from-primary/10 to-secondary/10' : ''
      }`}></div>
      
      {/* 顶部装饰条 */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
        isNavigating ? '!scale-x-100' : ''
      }`}></div>

      {/* 加载覆盖层 */}
      {isNavigating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              {showSparkles && (
                <>
                  <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-secondary animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
            <div className="text-sm font-medium text-primary animate-pulse">
              Loading article...
            </div>
          </div>
        </div>
      )}

      {/* 粒子效果 */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-5">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full animate-particle-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1000}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* 闪光效果 */}
      {isNavigating && (
        <div className="absolute inset-0 animate-shimmer pointer-events-none z-5 rounded-2xl"></div>
      )}
      
      <div className="relative p-6 flex flex-col h-full">
        {/* 文章标签 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <BookOpen className="h-3 w-3" />
            Article
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
            <TrendingUp className="h-3 w-3" />
            Tips
          </div>
        </div>

        <header className="mb-6 flex-grow">
          <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
            <button 
              onClick={(e) => handleArticleClick(e, blog.slug)}
              className="hover:underline decoration-2 underline-offset-2 text-left w-full"
              disabled={isNavigating}
            >
              {blog.title}
            </button>
          </h2>

          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {blog.description}
          </p>
        </header>

        <footer className="mt-auto space-y-4">
          {/* 元数据 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {publishedDate && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{publishedDate}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-secondary" />
              </div>
              <span className="font-medium">5 min</span>
            </div>
          </div>

          {/* 阅读更多按钮 */}
          <button
            onClick={(e) => handleArticleClick(e, blog.slug)}
            disabled={isNavigating}
            className={`group/btn inline-flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 text-foreground font-medium rounded-xl transition-all duration-300 hover:shadow-md border border-transparent hover:border-primary/20 disabled:opacity-70 disabled:cursor-not-allowed ${
              isNavigating ? 'from-primary/10 to-secondary/10 shadow-md border-primary/20' : ''
            }`}
          >
            <span className={`group-hover/btn:text-primary transition-colors ${isNavigating ? 'text-primary' : ''}`}>
              {isNavigating ? 'Opening article...' : 'Read full article'}
            </span>
            <div className="flex items-center gap-1 text-primary">
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              )}
            </div>
          </button>
        </footer>
      </div>
    </article>
  );
}