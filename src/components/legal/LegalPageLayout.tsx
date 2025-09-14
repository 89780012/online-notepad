'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Clock,
  ScrollText
} from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
  type: 'privacy' | 'terms';
}

export default function LegalPageLayout({
  title,
  description,
  lastUpdated,
  children,
  type
}: LegalPageLayoutProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between m-auto px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('back')}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ScrollText className="h-4 w-4" />
            <span>{type === 'privacy' ? t('privacyPolicy') : t('termsOfService')}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center">
          {/* Title Section */}
          <div className="mb-8 text-center w-full">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              {description}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{lastUpdated}</span>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="mb-8 p-6 w-full">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
              <ScrollText className="h-5 w-5" />
              {t('tableOfContents')}
            </h2>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {type === 'privacy' ? (
                <>
                  <a href="#section1" className="text-primary hover:underline text-center md:text-left">
                    1. {t('privacySection1Title')}
                  </a>
                  <a href="#section2" className="text-primary hover:underline text-center md:text-left">
                    2. {t('privacySection2Title')}
                  </a>
                  <a href="#section3" className="text-primary hover:underline text-center md:text-left">
                    3. {t('privacySection3Title')}
                  </a>
                  <a href="#section4" className="text-primary hover:underline text-center md:text-left">
                    4. {t('privacySection4Title')}
                  </a>
                  <a href="#section5" className="text-primary hover:underline text-center md:text-left">
                    5. {t('privacySection5Title')}
                  </a>
                </>
              ) : (
                <>
                  <a href="#section1" className="text-primary hover:underline text-center md:text-left">
                    1. {t('termsSection1Title')}
                  </a>
                  <a href="#section2" className="text-primary hover:underline text-center md:text-left">
                    2. {t('termsSection2Title')}
                  </a>
                  <a href="#section3" className="text-primary hover:underline text-center md:text-left">
                    3. {t('termsSection3Title')}
                  </a>
                  <a href="#section4" className="text-primary hover:underline text-center md:text-left">
                    4. {t('termsSection4Title')}
                  </a>
                </>
              )}
            </nav>
          </Card>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none mx-auto w-full">
            <div className="legal-content space-y-8">
              {children}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center sm:text-right">
                <p>{lastUpdated}</p>
                <p className="mt-1">Mini Notepad - {t('secureAndPrivate')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header {
            display: none !important;
          }

          .prose {
            max-width: none !important;
          }

          .prose h1,
          .prose h2,
          .prose h3 {
            break-after: avoid;
          }

          .prose p,
          .prose li {
            orphans: 3;
            widows: 3;
          }

          body {
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}