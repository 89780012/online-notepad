import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import type { BlogPostSummary } from '@/types/blog';

interface BlogCardProps {
  blog: BlogPostSummary;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <article className="group relative bg-card rounded-2xl border border-border/50 p-0 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:border-primary/20 hover:-translate-y-1 overflow-hidden">
      {/* 装饰性渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* 顶部装饰条 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      
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
            <Link href={`/blog/${blog.slug}`} className="hover:underline decoration-2 underline-offset-2">
              {blog.title}
            </Link>
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
          <Link
            href={`/blog/${blog.slug}`}
            className="group/btn inline-flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 text-foreground font-medium rounded-xl transition-all duration-300 hover:shadow-md border border-transparent hover:border-primary/20"
          >
            <span className="group-hover/btn:text-primary transition-colors">
              Read full article
            </span>
            <div className="flex items-center gap-1 text-primary">
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>
        </footer>
      </div>
    </article>
  );
}