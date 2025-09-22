import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { BlogPostSummary } from '@/types/blog';

interface BlogCardProps {
  blog: BlogPostSummary;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <article className="group bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <div className="flex flex-col h-full">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            <Link href={`/blog/${blog.slug}`} className="hover:underline">
              {blog.title}
            </Link>
          </h2>

          <p className="text-muted-foreground line-clamp-3">
            {blog.description}
          </p>
        </header>

        <footer className="mt-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            {publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{publishedDate}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5 min read</span>
            </div>
          </div>

          <Link
            href={`/blog/${blog.slug}`}
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            Read more
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </footer>
      </div>
    </article>
  );
}