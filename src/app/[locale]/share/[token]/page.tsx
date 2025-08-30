import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageToggle from '@/components/LanguageToggle';

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
  params: Promise<{ token: string; locale: string }>;
}) {
  const {token, locale} = await params;
  const t = await getTranslations();
  const note = await getSharedNote(token);
  
  if (!note) {
    notFound();
  }
  
  const formattedDate = new Date(note.updatedAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {t('title')}
          </h1>
          <LanguageToggle />
        </header>
        
        <main className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{note.title}</span>
                <span className="text-sm font-normal text-slate-500">
                  {t('lastUpdated')}: {formattedDate}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-base leading-relaxed min-h-[400px] p-4 bg-slate-50 rounded-lg">
                {note.content || t('writeNote')}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}