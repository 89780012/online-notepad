import { Metadata } from 'next';
import BlogList from '@/components/BlogList';

export const metadata: Metadata = {
  title: 'Blog - Online Notepad',
  description: 'Discover insights about digital note-taking, markdown editing, and productivity tips.',
  keywords: 'blog, digital notes, markdown, productivity, writing tips',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Insights about digital note-taking, markdown editing, and productivity tips.
            </p>
          </header>

          <BlogList />
        </div>
      </div>
    </div>
  );
}