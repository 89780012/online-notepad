import { useTranslations } from 'next-intl';
import NoteEditor from '@/components/NoteEditor';
import LanguageToggle from '@/components/LanguageToggle';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {t('title')}
          </h1>
          <LanguageToggle />
        </header>
        
        <main>
          <NoteEditor />
        </main>
      </div>
    </div>
  );
}