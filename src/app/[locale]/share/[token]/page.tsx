import { getTranslations } from 'next-intl/server';
import LanguageToggle from '@/components/LanguageToggle';
import MarkdownPreview from '@/components/MarkdownPreview';
import ClientDateFormatter from '@/components/ClientDateFormatter';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SharedNote {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

async function getSharedNote(token: string): Promise<SharedNote | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notes/share/${token}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching shared note:', error);
    return null;
  }
}

export default async function SharedNotePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const {token} = await params;
  const t = await getTranslations();
  const note = await getSharedNote(token);

  if(note == null) {
    return <div>Not Found</div>;
  }

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t('title')}
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </header>
        
          <main>
            {/* 笔记标题 */}
            <div className="flex items-center justify-between mb-6 p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                <h1 className="text-xl font-semibold text-card-foreground ml-4">
                  {note.title || t('untitledNote')}
                </h1>
              </div>
              <ClientDateFormatter
                dateString={note.updatedAt}
                className="text-sm text-muted-foreground"
              />
            </div>

            {/* Markdown 内容预览 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <MarkdownPreview 
                content={note.content}
                className="prose prose-slate dark:prose-invert max-w-none prose-lg"
              />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}