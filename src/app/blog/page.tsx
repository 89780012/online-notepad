import { Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'lucide-react';
import BlogList from '@/components/BlogList';

export const metadata: Metadata = {
  title: 'Blog - Online Notepad',
  description: 'Discover insights about digital note-taking, markdown editing, and productivity tips.',
  keywords: 'blog, digital notes, markdown, productivity, writing tips',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 group"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
              </Link>
              <div className="h-4 w-px bg-border"></div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Blog</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Digital Note-Taking Insights
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Latest Articles
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Digital Note-Taking
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Insights & Tips
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover the latest trends in digital note-taking, markdown editing techniques, 
              and productivity strategies to enhance your writing workflow.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <BlogList />
        </div>
      </div>
    </div>
  );
}