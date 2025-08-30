import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CardTitle } from '@/components/ui/card';
import LanguageToggle from '@/components/LanguageToggle';
import PaperCard from '@/components/PaperCard';
import NoteDisplay from '@/components/NoteDisplay';

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
          <PaperCard
            header={
              <CardTitle className="flex items-center justify-between text-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                  <span className="ml-4 font-semibold">{note.title || t('untitledNote')}</span>
                </div>
                <span className="text-sm font-normal text-slate-500">
                  {t('lastUpdated')}: {formattedDate}
                </span>
              </CardTitle>
            }
          >
            <NoteDisplay
              title={note.title}
              content={note.content}
              showPlaceholder={false}
            />
          </PaperCard>
        </main>
      </div>
    </div>
  );
}