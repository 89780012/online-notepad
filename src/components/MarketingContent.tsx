'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Plus } from 'lucide-react';

interface MarketingContentProps {
  onNewNote?: () => void;
}

export default function MarketingContent({ onNewNote }: MarketingContentProps) {
  const t = useTranslations();

  const features = [
    { text: t('featureFree'), key: 'free' },
    { text: t('featureFast'), key: 'fast' },
    { text: t('featureDarkMode'), key: 'dark' },
    { text: t('featureOffline'), key: 'offline' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card/50 paper-texture">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl font-serif">
          {t('heroTitle')}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {t('heroSubtitle')}
        </p>

        {/* CTA按钮 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onNewNote}
            size="lg"
            className="text-base px-8 py-3 font-semibold bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('newNote')}
          </Button>
          {/* <Button
            variant="outline"
            size="lg"
            className="text-base px-8 py-3"
            onClick={onNewNote}
          >
            <Edit className="w-5 h-5 mr-2" />
            {t('startWriting')}
          </Button> */}
        </div>

        <Card className="mt-12 text-left bg-card/80 backdrop-blur-sm shadow-xl border-border">
          <CardHeader>
            <CardTitle className="font-serif text-foreground">{t('featureListTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature.key} className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" />
                  <span className="text-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}